"""
HackEasy MCP Server - Model Context Protocol server for hackathon automation.

Provides tools for generating winning projects, simulating judging,
improving rubric scores, rendering videos, generating pitch decks,
and analyzing Devpost rules.

Usage (MCP mode):
    python hackeasy_mcp_server.py

Usage (CLI fallback):
    python hackeasy_mcp_server.py generate "Hackathon Name" 24
    python hackeasy_mcp_server.py simulate "project desc" '{"category": 5}'
    python hackeasy_mcp_server.py render /path/to/screenshots
    python hackeasy_mcp_server.py pitchdeck '{"title": "..."}' '{"category": 5}'
    python hackeasy_mcp_server.py rules https://devpost.com/...
    python hackeasy_mcp_server.py improve /path/to/project code_quality
"""

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
        logging.FileHandler(Path(__file__).parent / "hackeasy.log"),
        logging.StreamHandler(sys.stderr),
    ],
)
logger = logging.getLogger("hackeasy-mcp")

sys.path.insert(0, str(Path(__file__).parent))

try:
    from mcp.server import Server, NotificationOptions
    from mcp.server.models import InitializationOptions
    import mcp.server.stdio
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False

from lib.ai_client import AIClient
from lib.cache import HackEasyCache
from agents.idea_agent import IdeaAgent
from agents.pitch_agent import PitchAgent
from agents.video_agent import VideoAgent
from agents.code_agent import CodeAgent

ai_client = AIClient()
cache = HackEasyCache()
idea_agent = IdeaAgent(ai_client, cache)
pitch_agent = PitchAgent(ai_client)
video_agent = VideoAgent()
code_agent = CodeAgent(ai_client)


def _log_call(tool_name: str, params: dict, result: any) -> None:
    logger.info(
        "CALL tool=%s params=%s result=%s",
        tool_name,
        json.dumps(params, default=str),
        json.dumps({"status": "ok"} if isinstance(result, dict) and "error" not in result else result, default=str),
    )


def _error_result(message: str) -> dict:
    return {"error": message, "status": "failed"}


async def generate_winning_project(
    hackathon_name: str,
    duration_hours: float,
    track: str = "",
    team_members: list[str] | None = None,
    tech_stack_preferences: list[str] | None = None,
    existing_idea: str = "",
) -> dict:
    try:
        idea = await idea_agent.generate(
            hackathon_name=hackathon_name,
            duration_hours=duration_hours,
            track=track or None,
            team_members=team_members or [],
            tech_preferences=tech_stack_preferences or [],
            existing_idea=existing_idea or None,
        )
        result = {
            "project_idea": idea.get("problem_statement", ""),
            "tech_stack": idea.get("tech_stack", []),
            "repo_url": idea.get("repo_url", ""),
            "demo_url": idea.get("demo_url", ""),
            "pitch_deck_url": idea.get("pitch_deck_url", ""),
            "video_url": idea.get("video_url", ""),
            "estimated_win_probability": idea.get("estimated_win_probability", 0.0),
        }
        _log_call("generate_winning_project", locals(), result)
        return result
    except Exception as e:
        logger.exception("generate_winning_project failed")
        return _error_result(str(e))


async def simulate_judging(project_description: str, rubric_json: str) -> dict:
    try:
        rubric = json.loads(rubric_json) if isinstance(rubric_json, str) else rubric_json
        prompt = (
            f"Judge the following hackathon project against this rubric:\n\n"
            f"RUBRIC: {json.dumps(rubric)}\n\n"
            f"PROJECT: {project_description}\n\n"
            f"Return a JSON object with each rubric category as a key, a score (0-10) and brief reasoning."
        )
        response = await ai_client.chat(prompt)
        scores = response if isinstance(response, dict) else json.loads(response)
        total = sum(
            v for v in scores.values() if isinstance(v, (int, float))
        )
        result = {"scores": scores, "total": total, "max_possible": len(scores) * 10}
        _log_call("simulate_judging", locals(), result)
        return result
    except Exception as e:
        logger.exception("simulate_judging failed")
        return _error_result(str(e))


async def improve_rubric_score(project_dir: str, category: str) -> dict:
    try:
        project_path = Path(project_dir)
        if not project_path.is_dir():
            return _error_result(f"Directory not found: {project_dir}")

        files = list(project_path.rglob("*.py")) + list(project_path.rglob("*.js")) + list(project_path.rglob("*.tsx"))
        code_summary = "\n".join(
            f"{f.relative_to(project_path)}: {f.stat().st_size} bytes" for f in files[:20]
        )

        prompt = (
            f"We need to improve the rubric category '{category}' for a hackathon project.\n\n"
            f"Project files:\n{code_summary}\n\n"
            f"Provide a plan to address '{category}' with specific code changes "
            f"and estimate the score improvement (0-10 points). "
            f"Respond as JSON with keys: plan (list of steps), estimated_improvement (number), rationale (str)."
        )
        response = await ai_client.chat(prompt)
        plan = response if isinstance(response, dict) else json.loads(response)
        result = {
            "plan": plan.get("plan", []),
            "estimated_improvement": plan.get("estimated_improvement", 1),
            "rationale": plan.get("rationale", ""),
        }
        _log_call("improve_rubric_score", locals(), result)
        return result
    except Exception as e:
        logger.exception("improve_rubric_score failed")
        return _error_result(str(e))


async def render_product_video(
    screenshot_dir: str,
    duration_seconds: float = 60,
    voiceover_text: str = "",
) -> dict:
    try:
        video_path = await video_agent.generate(
            screenshot_dir=screenshot_dir,
            duration_seconds=duration_seconds,
            voiceover_text=voiceover_text,
        )
        result = {"video_url": video_path}
        _log_call("render_product_video", locals(), result)
        return result
    except Exception as e:
        logger.exception("render_product_video failed")
        return _error_result(str(e))


async def generate_pitch_deck(project_data: str, rubric: str) -> dict:
    try:
        project = json.loads(project_data) if isinstance(project_data, str) else project_data
        rubric_data = json.loads(rubric) if isinstance(rubric, str) else rubric
        pdf_path = await pitch_agent.generate(project, rubric_data)
        result = {"deck_url": pdf_path}
        _log_call("generate_pitch_deck", locals(), result)
        return result
    except Exception as e:
        logger.exception("generate_pitch_deck failed")
        return _error_result(str(e))


async def analyze_devpost_rules(devpost_url: str) -> dict:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(devpost_url)
            resp.raise_for_status()
            html = resp.text

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")

        rules_section = soup.find("div", class_="content")
        rules_text = rules_section.get_text(strip=True) if rules_section else ""

        deadline_el = soup.find("meta", property="article:expiration_time")
        deadline = deadline_el.get("content", "") if deadline_el else ""

        prizes = []
        for li in soup.select(".prize-list li, .prizes li"):
            prizes.append(li.get_text(strip=True))

        tracks = []
        for h in soup.select(".theme-block h3, .track h3"):
            tracks.append(h.get_text(strip=True))

        result = {
            "rules_summary": rules_text[:2000],
            "deadline": deadline,
            "prizes": prizes,
            "tracks": tracks,
            "url": devpost_url,
        }
        _log_call("analyze_devpost_rules", locals(), result)
        return result
    except ImportError:
        return _error_result("httpx and beautifulsoup4 are required for Devpost analysis. Install with: pip install httpx beautifulsoup4")
    except Exception as e:
        logger.exception("analyze_devpost_rules failed")
        return _error_result(str(e))


async def run_cli_mode() -> None:
    args = sys.argv[1:]
    if not args:
        print("Usage:")
        print('  python hackeasy_mcp_server.py generate "Name" 24')
        print('  python hackeasy_mcp_server.py simulate "desc" \'{"cat":5}\'')
        print('  python hackeasy_mcp_server.py render /path/to/screenshots')
        print('  python hackeasy_mcp_server.py pitchdeck \'{}\' \'{}\'')
        print('  python hackeasy_mcp_server.py rules https://devpost.com/...')
        print('  python hackeasy_mcp_server.py improve /path project_dir category')
        return

    command = args[0]

    if command == "generate":
        name = args[1] if len(args) > 1 else "Untitled"
        duration = float(args[2]) if len(args) > 2 else 24
        result = await generate_winning_project(name, duration)
    elif command == "simulate":
        desc = args[1] if len(args) > 1 else ""
        rubric = args[2] if len(args) > 2 else "{}"
        result = await simulate_judging(desc, rubric)
    elif command == "render":
        sdir = args[1] if len(args) > 1 else "."
        dur = float(args[2]) if len(args) > 2 else 60
        result = await render_product_video(sdir, dur)
    elif command == "pitchdeck":
        pdata = args[1] if len(args) > 1 else "{}"
        rub = args[2] if len(args) > 2 else "{}"
        result = await generate_pitch_deck(pdata, rub)
    elif command == "rules":
        url = args[1] if len(args) > 1 else ""
        result = await analyze_devpost_rules(url)
    elif command == "improve":
        pdir = args[1] if len(args) > 1 else "."
        cat = args[2] if len(args) > 2 else "general"
        result = await improve_rubric_score(pdir, cat)
    else:
        print(f"Unknown command: {command}")
        return

    print(json.dumps(result, indent=2, default=str))


async def run_mcp_mode() -> None:
    server = Server("hackeasy-mcp")

    @server.list_tools()
    async def list_tools() -> list:
        return [
            {
                "name": "generate_winning_project",
                "description": "Generate a winning hackathon project idea using the 7-step formula",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "hackathon_name": {"type": "string", "description": "Name of the hackathon"},
                        "duration_hours": {"type": "number", "description": "Duration in hours"},
                        "track": {"type": "string", "description": "Optional track/theme"},
                        "team_members": {"type": "array", "items": {"type": "string"}, "description": "Team member names"},
                        "tech_stack_preferences": {"type": "array", "items": {"type": "string"}, "description": "Preferred technologies"},
                        "existing_idea": {"type": "string", "description": "Existing idea to build upon"},
                    },
                    "required": ["hackathon_name", "duration_hours"],
                },
            },
            {
                "name": "simulate_judging",
                "description": "Simulate hackathon judging on a project description with a rubric",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "project_description": {"type": "string", "description": "Description of the project"},
                        "rubric_json": {"type": "string", "description": "JSON rubric with category names and max scores"},
                    },
                    "required": ["project_description", "rubric_json"],
                },
            },
            {
                "name": "improve_rubric_score",
                "description": "Analyze a project directory and suggest improvements for a specific rubric category",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "project_dir": {"type": "string", "description": "Path to the project directory"},
                        "category": {"type": "string", "description": "Rubric category to improve"},
                    },
                    "required": ["project_dir", "category"],
                },
            },
            {
                "name": "render_product_video",
                "description": "Render a product demo video from screenshots with optional voiceover",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "screenshot_dir": {"type": "string", "description": "Directory containing screenshots"},
                        "duration_seconds": {"type": "number", "description": "Total video duration in seconds"},
                        "voiceover_text": {"type": "string", "description": "Voiceover narration text"},
                    },
                    "required": ["screenshot_dir"],
                },
            },
            {
                "name": "generate_pitch_deck",
                "description": "Generate a pitch deck PDF from project data and rubric",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "project_data": {"type": "string", "description": "JSON string of project data"},
                        "rubric": {"type": "string", "description": "JSON string of the rubric"},
                    },
                    "required": ["project_data", "rubric"],
                },
            },
            {
                "name": "analyze_devpost_rules",
                "description": "Scrape and parse Devpost hackathon rules, tracks, prizes, and deadlines",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "devpost_url": {"type": "string", "description": "URL of the Devpost hackathon page"},
                    },
                    "required": ["devpost_url"],
                },
            },
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list:
        tool_map = {
            "generate_winning_project": generate_winning_project,
            "simulate_judging": simulate_judging,
            "improve_rubric_score": improve_rubric_score,
            "render_product_video": render_product_video,
            "generate_pitch_deck": generate_pitch_deck,
            "analyze_devpost_rules": analyze_devpost_rules,
        }

        handler = tool_map.get(name)
        if not handler:
            raise ValueError(f"Unknown tool: {name}")

        result = await handler(**arguments)
        return [{"type": "text", "text": json.dumps(result, indent=2, default=str)}]

    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="hackeasy-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


async def main() -> None:
    if MCP_AVAILABLE and len(sys.argv) == 1:
        await run_mcp_mode()
    else:
        await run_cli_mode()


if __name__ == "__main__":
    asyncio.run(main())
