"""
IdeaAgent - Generates winning hackathon project ideas using a 7-step formula.

The 7-step formula:
1. Category - Identify the hackathon category/track
2. Constraint - List constraints (time, team size, tech, theme)
3. Problem - Find a specific, urgent problem in the category
4. Solution - Design the simplest possible AI-powered solution
5. Demo - Plan the demo flow for maximum impact
6. Angle - Craft the narrative hook
7. Viability - Score the idea's win probability
"""

import json
import logging
import math
from datetime import datetime

logger = logging.getLogger("hackeasy.idea_agent")

WINNING_ANGLE_TEMPLATES = [
    "We built in 24h what {big_company} spent $X million on",
    "AI for {niche} — no one is solving this",
    "The {product} for {audience}",
    "What if {x} but {y}?",
    "Democratizing {complex_thing} for everyone",
    "We asked {n} {target_users} what they needed — this is it",
]

VIABILITY_WEIGHTS = {
    "technical_feasibility": 0.20,
    "demo_ability": 0.30,
    "uniqueness": 0.25,
    "judge_appeal": 0.25,
}


class IdeaAgent:
    """Generates winning hackathon project ideas using the 7-step formula."""

    def __init__(self, ai_client, cache=None):
        self.ai = ai_client
        self.cache = cache

    async def generate(
        self,
        hackathon_name: str,
        duration_hours: float,
        track: str | None = None,
        team_members: list[str] | None = None,
        tech_preferences: list[str] | None = None,
        existing_idea: str | None = None,
    ) -> dict:
        """Generate a winning project idea using the 7-step formula."""
        team_size = len(team_members) if team_members else 1

        logger.info(
            "Generating idea for hackathon=%s duration=%sh track=%s team=%d",
            hackathon_name, duration_hours, track or "any", team_size,
        )

        cache_key = f"idea:{hackathon_name}:{duration_hours}:{track}:{team_size}"
        if self.cache:
            cached = await self.cache.get(cache_key)
            if cached:
                logger.info("Returning cached idea")
                return cached

        constraints = self._build_constraints(duration_hours, team_size, tech_preferences)
        category = track or "General / Open Track"

        if existing_idea:
            prompt = self._build_refinement_prompt(
                hackathon_name, category, constraints, existing_idea, team_members
            )
        else:
            prompt = self._build_generation_prompt(
                hackathon_name, category, constraints, tech_preferences, team_members
            )

        response = await self.ai.chat(prompt)

        try:
            idea = json.loads(response) if isinstance(response, str) else response
        except (json.JSONDecodeError, TypeError):
            idea = {
                "problem_statement": str(response)[:500],
                "target_user": "TBD",
                "workflow_before": "Manual process",
                "ai_step": "AI automation",
                "demo_flow": "Live demo",
                "angle": category,
                "tech_stack": tech_preferences or ["Python", "React", "Next.js"],
            }

        idea["hackathon_name"] = hackathon_name
        idea["track"] = category
        idea["team_members"] = team_members or []
        idea["duration_hours"] = duration_hours

        feasibility = self.evaluate_feasibility(idea, duration_hours)
        idea["feasibility"] = feasibility
        idea["estimated_win_probability"] = feasibility["overall"]
        idea["generated_at"] = datetime.utcnow().isoformat()

        if self.cache:
            await self.cache.set(cache_key, idea, ttl=3600)

        return idea

    def _build_constraints(self, duration_hours: float, team_size: int, tech_prefs: list[str] | None) -> dict:
        return {
            "time": f"{duration_hours} hours",
            "team": f"{team_size} developer{'s' if team_size > 1 else ''}",
            "tech": ", ".join(tech_prefs) if tech_prefs else "any stack (prefer Python + JS)",
            "scope": "prototype with working demo, not production",
        }

    def _build_generation_prompt(
        self,
        hackathon_name: str,
        category: str,
        constraints: dict,
        tech_preferences: list[str] | None,
        team_members: list[str] | None,
    ) -> str:
        return f"""You are a world-class hackathon strategist. Generate a winning project idea using this 7-step formula:

HACKATHON: {hackathon_name}
TRACK/CATEGORY: {category}
CONSTRAINTS: {json.dumps(constraints)}
{'TECH PREFERENCES: ' + ', '.join(tech_preferences) if tech_preferences else ''}
{'TEAM: ' + ', '.join(team_members) if team_members else ''}

Return a JSON object with exactly these keys:
1. "problem_statement" (str): The problem being solved (2-3 sentences)
2. "target_user" (str): Who has this problem
3. "workflow_before" (str): How it's done today (pain points)
4. "ai_step" (str): What the AI does (be specific about models/approach)
5. "demo_flow" (str): Step-by-step demo plan (3-5 steps)
6. "angle" (str): The narrative hook / why judges will care
7. "tech_stack" (list of str): Exact technologies to use
8. "estimated_win_probability" (float): 0.0 to 1.0

RULES:
- Solve ONE specific problem well
- Must be demoable in 3 minutes
- AI must be essential, not bolted-on
- Prefer live demos over slides
- The problem must be immediately understood by judges"""

    def _build_refinement_prompt(
        self,
        hackathon_name: str,
        category: str,
        constraints: dict,
        existing_idea: str,
        team_members: list[str] | None,
    ) -> str:
        return f"""You are a world-class hackathon strategist. Refine this existing idea:

HACKATHON: {hackathon_name}
TRACK: {category}
CONSTRAINTS: {json.dumps(constraints)}
EXISTING IDEA: {existing_idea}
{'TEAM: ' + ', '.join(team_members) if team_members else ''}

Return a JSON object (same schema as above) that improves the idea by:
- Making it more specific
- Adding a stronger AI angle
- Planning a more impressive demo
- Sharpening the narrative hook
- Improving win probability"""

    def evaluate_feasibility(self, idea: dict, duration_hours: float) -> dict:
        """Score the idea across four dimensions (0-1 each)."""
        scores = {}

        tech_stack = idea.get("tech_stack", [])
        has_ai = any(kw in str(tech_stack).lower() for kw in ["ai", "gpt", "llm", "transformers", "bert", "whisper", "clip"])
        demo_flow = idea.get("demo_flow", "")
        problem = idea.get("problem_statement", "")

        scores["technical_feasibility"] = self._score_technical_feasibility(tech_stack, duration_hours)
        scores["demo_ability"] = self._score_demo_ability(demo_flow, duration_hours)
        scores["uniqueness"] = self._score_uniqueness(problem, has_ai)
        scores["judge_appeal"] = self._score_judge_appeal(problem, has_ai, idea.get("angle", ""))

        overall = sum(scores[k] * VIABILITY_WEIGHTS[k] for k in VIABILITY_WEIGHTS)
        overall = round(min(max(overall, 0.0), 1.0), 2)

        return {
            "overall": overall,
            "breakdown": {k: round(v, 2) for k, v in scores.items()},
        }

    def _score_technical_feasibility(self, tech_stack: list, duration_hours: float) -> float:
        familiar_techs = {"python", "javascript", "typescript", "react", "next.js", "fastapi", "flask"}
        if not tech_stack:
            return 0.5
        known = sum(1 for t in tech_stack if t.lower() in familiar_techs)
        ratio = known / len(tech_stack)
        time_factor = min(duration_hours / 24, 1.0)
        return min(ratio * 0.6 + time_factor * 0.4 + 0.1, 1.0)

    def _score_demo_ability(self, demo_flow: str, duration_hours: float) -> float:
        if not demo_flow:
            return 0.4
        steps = demo_flow.count("\n") + 1
        has_live = any(kw in demo_flow.lower() for kw in ["live", "realtime", "click", "show", "type"])
        base = 0.5 + (0.1 * min(steps, 5))
        if has_live:
            base += 0.2
        time_bonus = min(duration_hours / 48, 0.2)
        return min(base + time_bonus, 1.0)

    def _score_uniqueness(self, problem: str, has_ai: bool) -> float:
        if not problem:
            return 0.5
        common_patterns = ["chatbot", "todo", "crud", "weather", "blog", "ecommerce"]
        is_common = any(p in problem.lower() for p in common_patterns)
        base = 0.4 if is_common else 0.7
        if has_ai:
            base += 0.15
        return min(base + (len(problem) / 1000) * 0.05, 1.0)

    def _score_judge_appeal(self, problem: str, has_ai: bool, angle: str) -> float:
        score = 0.5
        if has_ai:
            score += 0.15
        if angle:
            score += 0.1
        impact_keywords = ["access", "save", "help", "solve", "crisis", "health", "environment", "climate", "education"]
        found = sum(1 for kw in impact_keywords if kw in problem.lower())
        score += found * 0.03
        return min(score, 1.0)
