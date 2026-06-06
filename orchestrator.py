"""
Orchestrator - Main entry point that ties together all HackEasy agents.

Reads config, generates ideas, builds code, deploys, creates pitch deck,
renders video, runs judge simulation, and iteratively improves.

Usage:
    python orchestrator.py --name "MyHack" --duration 24 --track "Climate Tech"
    python orchestrator.py --dry-run --name "TestHack"
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(Path(__file__).parent / "orchestrator.log"),
        logging.StreamHandler(sys.stderr),
    ],
)
logger = logging.getLogger("hackeasy.orchestrator")

sys.path.insert(0, str(Path(__file__).parent))

from lib.ai_client import AIClient
from lib.cache import HackEasyCache
from agents.idea_agent import IdeaAgent
from agents.code_agent import CodeAgent
from agents.pitch_agent import PitchAgent
from agents.video_agent import VideoAgent

MAX_IMPROVEMENT_ROUNDS = 3
DEFAULT_CONFIG = {
    "github_token": "",
    "vercel_token": "",
    "default_duration_hours": 24,
    "output_dir": "output",
    "deploy": {
        "enabled": False,
        "github_repo_prefix": "hackeasy-",
        "vercel_project_name": "",
    },
}


class Orchestrator:
    """Main orchestrator that coordinates all hackathon agents."""

    def __init__(self, config: dict | None = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self.ai_client = AIClient()
        self.cache = HackEasyCache()
        self.idea_agent = IdeaAgent(self.ai_client, self.cache)
        self.code_agent = CodeAgent(self.ai_client)
        self.pitch_agent = PitchAgent(self.ai_client)
        self.video_agent = VideoAgent()
        self.results = {}

    async def run(
        self,
        hackathon_name: str,
        duration_hours: float,
        track: str = "",
        team_members: list[str] | None = None,
        tech_preferences: list[str] | None = None,
        existing_idea: str = "",
    ) -> dict:
        """Run the full hackathon pipeline."""
        logger.info("Starting pipeline: %s (%sh)", hackathon_name, duration_hours)
        start_time = datetime.utcnow()

        os.makedirs(self.config["output_dir"], exist_ok=True)

        # Step 1: Generate idea
        logger.info("Step 1: Generating winning idea...")
        idea = await self.idea_agent.generate(
            hackathon_name=hackathon_name,
            duration_hours=duration_hours,
            track=track or None,
            team_members=team_members or [],
            tech_preferences=tech_preferences or [],
            existing_idea=existing_idea or None,
        )
        self.results["idea"] = idea
        logger.info("Idea generated: win_probability=%.2f", idea.get("estimated_win_probability", 0))

        # Step 2: Generate code
        logger.info("Step 2: Building project...")
        project_dir = await self.code_agent.generate(
            idea=idea,
            tech_stack=idea.get("tech_stack", tech_preferences),
            duration_hours=duration_hours,
        )
        self.results["project_dir"] = project_dir
        logger.info("Project built at: %s", project_dir)

        # Step 3: Deploy
        if self.config.get("deploy", {}).get("enabled"):
            logger.info("Step 3: Deploying...")
            github_url = await self._deploy_to_github(project_dir, hackathon_name)
            vercel_url = await self._deploy_to_vercel(project_dir)
            self.results["github_url"] = github_url
            self.results["vercel_url"] = vercel_url
        else:
            logger.info("Step 3: Skipping deploy (not enabled)")
            self.results["github_url"] = ""
            self.results["vercel_url"] = ""

        # Step 4: Generate pitch deck
        logger.info("Step 4: Generating pitch deck...")
        pitch_path = await self.pitch_agent.generate(
            project_data=idea,
            rubric=None,
        )
        self.results["pitch_deck_path"] = pitch_path

        # Step 5: Render video
        logger.info("Step 5: Rendering demo video...")
        screenshot_dir = self._find_screenshots(project_dir)
        video_path = await self.video_agent.generate(
            screenshot_dir=screenshot_dir,
            duration_seconds=60,
            voiceover_text=idea.get("problem_statement", ""),
        )
        self.results["video_path"] = video_path

        # Step 6: Judge simulation + improvement loop
        logger.info("Step 6: Running judge simulation...")
        rubric = {
            "Technical Complexity": 10,
            "Innovation": 10,
            "Impact": 10,
            "Presentation": 10,
            "Practicality": 10,
        }
        project_summary = json.dumps(idea, default=str)
        judge_result = await self._simulate_judging(project_summary, rubric)
        self.results["judging"] = judge_result

        current_score = judge_result.get("total", 0)
        improvement_rounds = 0

        while improvement_rounds < MAX_IMPROVEMENT_ROUNDS:
            lowest_category = self._find_lowest_category(judge_result.get("scores", {}))
            if not lowest_category:
                break

            logger.info(
                "Improvement round %d: focusing on '%s'",
                improvement_rounds + 1, lowest_category,
            )
            improvement = await self._improve_category(
                project_dir, lowest_category, rubric,
            )
            improvement_rounds += 1

            rejudge = await self._simulate_judging(
                json.dumps({"idea": idea, "improvement": improvement}, default=str),
                rubric,
            )
            new_score = rejudge.get("total", 0)

            if new_score > current_score:
                logger.info("Score improved: %d -> %d", current_score, new_score)
                current_score = new_score
                judge_result = rejudge

        self.results["final_judging"] = judge_result
        self.results["improvement_rounds"] = improvement_rounds

        # Step 7: Generate summary
        summary_path = await self._generate_summary(hackathon_name, start_time)
        self.results["summary_path"] = summary_path

        logger.info("Pipeline complete! Summary: %s", summary_path)
        return self.results

    async def _deploy_to_github(self, project_dir: str, hackathon_name: str) -> str:
        """Push project to GitHub repository."""
        import subprocess
        repo_name = f"{self.config['deploy']['github_repo_prefix']}{hackathon_name.lower().replace(' ', '-')}"
        token = self.config.get("github_token", "")
        if not token:
            logger.warning("No GitHub token configured, skipping deploy")
            return ""

        try:
            subprocess.run(["git", "init"], cwd=project_dir, capture_output=True)
            subprocess.run(["git", "add", "-A"], cwd=project_dir, capture_output=True)
            subprocess.run(
                ["git", "commit", "-m", "Initial commit from HackEasy"],
                cwd=project_dir, capture_output=True,
            )

            import requests
            resp = requests.post(
                "https://api.github.com/user/repos",
                headers={"Authorization": f"token {token}"},
                json={"name": repo_name, "private": False},
            )
            resp.raise_for_status()

            remote = f"https://{token}@github.com/{resp.json()['owner']['login']}/{repo_name}.git"
            subprocess.run(
                ["git", "remote", "add", "origin", remote],
                cwd=project_dir, capture_output=True,
            )
            subprocess.run(
                ["git", "push", "-u", "origin", "main"],
                cwd=project_dir, capture_output=True,
            )

            return f"https://github.com/{resp.json()['owner']['login']}/{repo_name}"
        except Exception as e:
            logger.error("GitHub deploy failed: %s", e)
            return ""

    async def _deploy_to_vercel(self, project_dir: str) -> str:
        """Deploy to Vercel using Vercel CLI."""
        import subprocess
        try:
            result = subprocess.run(
                ["vercel", "--yes", "--name", self.config["deploy"].get("vercel_project_name", "")],
                cwd=project_dir, capture_output=True, text=True, timeout=120,
            )
            url = result.stdout.strip().split("\n")[-1] if result.stdout else ""
            return url if url.startswith("https://") else ""
        except Exception as e:
            logger.error("Vercel deploy failed: %s", e)
            return ""

    def _find_screenshots(self, project_dir: str) -> str:
        """Find or create a screenshot directory for video generation."""
        public_dir = Path(project_dir) / "public"
        screenshots_dir = public_dir / "screenshots"
        if screenshots_dir.is_dir() and list(screenshots_dir.iterdir()):
            return str(screenshots_dir)

        screenshots_dir.mkdir(parents=True, exist_ok=True)
        return str(screenshots_dir)

    async def _simulate_judging(self, project_summary: str, rubric: dict) -> dict:
        """Run the judge simulator on current project state."""
        prompt = (
            f"Judge this hackathon project:\n\n{project_summary}\n\n"
            f"Rubric: {json.dumps(rubric)}\n\n"
            f"Return JSON with 'scores' (each category 0-10), "
            f"'total' (sum), and 'feedback' (str)."
        )
        try:
            response = await self.ai_client.chat(prompt)
            result = json.loads(response) if isinstance(response, str) else response
            return {
                "scores": result.get("scores", {k: 5 for k in rubric}),
                "total": result.get("total", 25),
                "feedback": result.get("feedback", ""),
            }
        except Exception as e:
            logger.error("Judge simulation failed: %s", e)
            return {
                "scores": {k: 5 for k in rubric},
                "total": 25,
                "feedback": "Auto-generated fallback scores.",
            }

    def _find_lowest_category(self, scores: dict) -> str | None:
        """Find the rubric category with the lowest score."""
        if not scores:
            return None
        return min(scores, key=scores.get)

    async def _improve_category(self, project_dir: str, category: str, rubric: dict) -> dict:
        """Generate improvement suggestions for a specific category."""
        prompt = (
            f"Project directory: {project_dir}\n"
            f"Category to improve: {category}\n"
            f"Rubric: {json.dumps(rubric)}\n\n"
            f"Return JSON with 'suggestions' (list of str) and "
            f"'code_changes' (list of dict with 'file' and 'change')."
        )
        try:
            response = await self.ai_client.chat(prompt)
            return json.loads(response) if isinstance(response, str) else response
        except Exception:
            return {"suggestions": [f"Improve {category}"], "code_changes": []}

    async def _generate_summary(self, hackathon_name: str, start_time: datetime) -> str:
        """Write a summary markdown file with all results."""
        duration = (datetime.utcnow() - start_time).total_seconds()
        summary = f"""# HackEasy Summary: {hackathon_name}

**Generated:** {datetime.utcnow().isoformat()}
**Pipeline Duration:** {duration:.1f}s
**Improvement Rounds:** {self.results.get("improvement_rounds", 0)}

## Project Idea

**Problem:** {self.results.get("idea", {}).get("problem_statement", "N/A")}
**Target Users:** {self.results.get("idea", {}).get("target_user", "N/A")}
**Win Probability:** {self.results.get("idea", {}).get("estimated_win_probability", 0):.0%}

**Tech Stack:** {", ".join(self.results.get("idea", {}).get("tech_stack", []))}

## Deliverables

| Resource | Link/Path |
|----------|-----------|
| Project Directory | `{self.results.get("project_dir", "N/A")}` |
| GitHub Repo | {self.results.get("github_url", "N/A") or "Not deployed"} |
| Live Demo | {self.results.get("vercel_url", "N/A") or "Not deployed"} |
| Pitch Deck | `{self.results.get("pitch_deck_path", "N/A")}` |
| Demo Video | `{self.results.get("video_path", "N/A")}` |

## Judge Scores

| Category | Score |
|----------|-------|
"""
        scores = self.results.get("final_judging", {}).get("scores", {})
        for cat, score in scores.items():
            summary += f"| {cat} | {score}/10 |\n"

        total = self.results.get("final_judging", {}).get("total", 0)
        summary += f"\n**Total:** {total}/{len(scores) * 10}\n\n"

        feedback = self.results.get("final_judging", {}).get("feedback", "")
        if feedback:
            summary += f"\n## Judge Feedback\n\n{feedback}\n"

        output_dir = Path(self.config["output_dir"])
        output_dir.mkdir(parents=True, exist_ok=True)
        summary_path = output_dir / f"{hackathon_name.lower().replace(' ', '_')}_summary.md"
        summary_path.write_text(summary, encoding="utf-8")
        return str(summary_path)


async def dry_run(
    hackathon_name: str = "TestHack",
    duration_hours: float = 24,
    track: str = "General",
) -> dict:
    """Run the orchestrator in dry-run mode (mock results, no external calls)."""
    logger.info("DRY RUN: %s (%sh)", hackathon_name, duration_hours)
    orchestrator = Orchestrator({"dry_run": True})

    temp_dir = tempfile.mkdtemp(suffix="_hackeasy_dryrun")

    results = {
        "hackathon_name": hackathon_name,
        "duration_hours": duration_hours,
        "track": track,
        "idea": {
            "problem_statement": f"Solving a critical problem in {track} using AI",
            "target_user": "Professionals in the space",
            "workflow_before": "Manual, time-consuming process",
            "ai_step": "AI-powered automation pipeline",
            "demo_flow": "1. Upload data 2. AI processes 3. Results displayed",
            "angle": f"The first AI solution for {track} built in a weekend",
            "tech_stack": ["Python", "React", "Next.js", "OpenAI API", "SQLite"],
            "estimated_win_probability": 0.78,
        },
        "project_dir": str(Path(temp_dir) / "project"),
        "github_url": f"https://github.com/hackeasy/{hackathon_name.lower().replace(' ', '-')}",
        "vercel_url": f"https://{hackathon_name.lower().replace(' ', '-')}.vercel.app",
        "pitch_deck_path": str(Path(temp_dir) / "pitch_deck.json"),
        "video_path": str(Path(temp_dir) / "demo.html"),
        "judging": {
            "scores": {
                "Technical Complexity": 7,
                "Innovation": 8,
                "Impact": 9,
                "Presentation": 7,
                "Practicality": 8,
            },
            "total": 39,
            "feedback": "Strong project with clear impact. Consider adding more technical depth in the demo.",
        },
        "final_judging": {
            "scores": {
                "Technical Complexity": 8,
                "Innovation": 8,
                "Impact": 9,
                "Presentation": 8,
                "Practicality": 8,
            },
            "total": 41,
            "feedback": "Improved presentation and technical complexity.",
        },
        "improvement_rounds": 1,
        "summary_path": str(Path(temp_dir) / "summary.md"),
    }

    summary_text = f"""# HackEasy Dry Run Summary: {hackathon_name}

**Mode:** DRY RUN
**Track:** {track}
**Win Probability:** 78%

This was a dry run. No code was generated, no deploys were made.

## What would have happened:
1. Idea generation using the 7-step formula
2. Full-stack Next.js project scaffolding
3. GitHub + Vercel deployment
4. 10-slide pitch deck creation
5. Demo video rendering
6. Judge simulation with 1 improvement round
7. Summary generation

## Mock Results
- **GitHub:** {results['github_url']}
- **Demo:** {results['vercel_url']}
- **Score:** 41/50

Run without --dry-run to execute the full pipeline.
"""
    summary_path = Path(temp_dir) / "summary.md"
    summary_path.write_text(summary_text, encoding="utf-8")
    results["summary_path"] = str(summary_path)

    print(json.dumps(results, indent=2, default=str))
    return results


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="HackEasy - AI-Powered Hackathon Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python orchestrator.py --name "MyHack" --duration 24 --track "Climate Tech"
  python orchestrator.py --name "QuickHack" --duration 12 --team "Alice,Bob" --tech "Python,React"
  python orchestrator.py --dry-run --name "TestHack"
        """,
    )
    parser.add_argument("--name", "-n", default="Untitled Hackathon", help="Hackathon name")
    parser.add_argument("--duration", "-d", type=float, default=24, help="Duration in hours")
    parser.add_argument("--track", "-t", default="", help="Track or theme")
    parser.add_argument("--team", "-tm", default="", help="Comma-separated team member names")
    parser.add_argument("--tech", "-tc", default="", help="Comma-separated tech preferences")
    parser.add_argument("--idea", "-i", default="", help="Existing idea to build upon")
    parser.add_argument("--dry-run", action="store_true", help="Run in dry-run mode (no real code generation)")
    parser.add_argument("--config", "-c", default="", help="Path to config JSON file")
    return parser.parse_args()


async def main() -> None:
    """Main entry point."""
    args = parse_args()

    config = {}
    if args.config:
        config_path = Path(args.config)
        if config_path.is_file():
            config = json.loads(config_path.read_text(encoding="utf-8"))

    config_path = Path(__file__).parent / "opencode.json"
    if config_path.is_file() and not config:
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass

    team_members = [m.strip() for m in args.team.split(",") if m.strip()] if args.team else []
    tech_prefs = [t.strip() for t in args.tech.split(",") if t.strip()] if args.tech else []

    if args.dry_run:
        await dry_run(
            hackathon_name=args.name,
            duration_hours=args.duration,
            track=args.track,
        )
        return

    orchestrator = Orchestrator(config)
    results = await orchestrator.run(
        hackathon_name=args.name,
        duration_hours=args.duration,
        track=args.track,
        team_members=team_members,
        tech_preferences=tech_prefs,
        existing_idea=args.idea,
    )

    print(f"\n{'='*60}")
    print(f"HackEasy Complete: {args.name}")
    print(f"{'='*60}")
    print(f"Project:    {results.get('project_dir', 'N/A')}")
    print(f"Summary:    {results.get('summary_path', 'N/A')}")
    print(f"Win Prob:   {results.get('idea', {}).get('estimated_win_probability', 0):.0%}")
    print(f"Judge Score: {results.get('final_judging', {}).get('total', 0)}/50")
    print(f"Improvements: {results.get('improvement_rounds', 0)} rounds")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())
