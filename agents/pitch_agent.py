"""
PitchAgent - Generates hackathon pitch decks, demo scripts, and Q&A prep.

Creates a 10-slide pitch deck structure, a word-for-word 3-minute demo script,
and top 10 Q&A prep questions with answers.
"""

import json
import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger("hackeasy.pitch_agent")

PITCH_DECK_SLIDES = [
    {
        "slide": 1,
        "title": "Title Slide",
        "content": "Project Name & Tagline",
        "visual_type": "screenshot",
        "notes": "Hook them in 5 seconds. Bold claim.",
        "duration_seconds": 10,
    },
    {
        "slide": 2,
        "title": "The Problem",
        "content": "What's broken? Who's affected? Why now?",
        "visual_type": "graph",
        "notes": "Make it personal. Use a story or statistic.",
        "duration_seconds": 20,
    },
    {
        "slide": 3,
        "title": "The Solution",
        "content": "What we built. How it works. The AI magic.",
        "visual_type": "screenshot",
        "notes": "Show the product. Live demo preferred.",
        "duration_seconds": 30,
    },
    {
        "slide": 4,
        "title": "How It Works",
        "content": "Architecture diagram / flow",
        "visual_type": "mermaid",
        "notes": "Keep it high-level. Focus on the novel part.",
        "duration_seconds": 20,
    },
    {
        "slide": 5,
        "title": "Demo",
        "content": "Live demo of the core feature",
        "visual_type": "screenshot",
        "notes": "This is the most important slide. Practice it.",
        "duration_seconds": 40,
    },
    {
        "slide": 6,
        "title": "Tech Stack",
        "content": "Key technologies and why we chose them",
        "visual_type": "bullet",
        "notes": "Show you made deliberate choices.",
        "duration_seconds": 15,
    },
    {
        "slide": 7,
        "title": "Impact",
        "content": "Metrics, users reached, problem solved",
        "visual_type": "graph",
        "notes": "Quantify everything. Real numbers > estimates.",
        "duration_seconds": 20,
    },
    {
        "slide": 8,
        "title": "Challenges",
        "content": "What was hard. How we overcame it.",
        "visual_type": "bullet",
        "notes": "Shows grit and learning. End with the win.",
        "duration_seconds": 15,
    },
    {
        "slide": 9,
        "title": "Next Steps",
        "content": "What's next after the hackathon",
        "visual_type": "bullet",
        "notes": "Show ambition. Judges want to see potential.",
        "duration_seconds": 10,
    },
    {
        "slide": 10,
        "title": "Thank You",
        "content": "Team, links, QR code to demo",
        "visual_type": "screenshot",
        "notes": "End strong. Include GitHub + demo URLs.",
        "duration_seconds": 10,
    },
]

QA_QUESTIONS = [
    {
        "question": "What makes this different from existing solutions?",
        "answer_framework": "Compare directly to 1-2 competitors. Highlight the AI differentiator.",
    },
    {
        "question": "How accurate is your AI model?",
        "answer_framework": "Be honest. Give your benchmark numbers. Acknowledge limitations.",
    },
    {
        "question": "What was the hardest technical challenge?",
        "answer_framework": "Describe a specific bug or design decision. Show what you learned.",
    },
    {
        "question": "How would you scale this?",
        "answer_framework": "Architecture changes needed, estimated costs, infrastructure plan.",
    },
    {
        "question": "Who is your target user?",
        "answer_framework": "Specific persona. Demographics, pain points, how you'd reach them.",
    },
    {
        "question": "How did you validate this problem?",
        "answer_framework": "User interviews, surveys, personal experience. Real evidence preferred.",
    },
    {
        "question": "What data did you train on?",
        "answer_framework": "Sources, size, preprocessing. Address bias and privacy concerns.",
    },
    {
        "question": "How long did it actually take to build?",
        "answer_framework": "Be real about the timeline. Highlight efficient decisions.",
    },
    {
        "question": "What would you do with more time?",
        "answer_framework": "Top 3 features or improvements. Show you think beyond the hackathon.",
    },
    {
        "question": "How do you make money / sustain this?",
        "answer_framework": "Business model if applicable. Open-source sustainability otherwise.",
    },
]


class PitchAgent:
    """Generates pitch decks, demo scripts, and Q&A prep."""

    def __init__(self, ai_client=None):
        self.ai = ai_client

    async def generate(self, project_data: dict, rubric: dict | None = None) -> str:
        """Generate a pitch deck as JSON and save it. Returns the output path."""
        output_dir = Path(__file__).parent.parent / "templates" / "pitch"
        output_dir.mkdir(parents=True, exist_ok=True)

        deck = self._create_deck_structure(project_data, rubric)
        script = await self._generate_demo_script(project_data)
        qa_prep = self._generate_qa_prep(project_data)

        deck_data = {
            "project": project_data,
            "rubric": rubric or {},
            "slides": deck,
            "demo_script": script,
            "qa_prep": qa_prep,
        }

        output_path = output_dir / "pitch_deck.json"
        output_path.write_text(json.dumps(deck_data, indent=2, default=str), encoding="utf-8")
        logger.info("Pitch deck saved to %s", output_path)

        md_path = self._write_markdown(deck_data, output_dir)
        logger.info("Pitch deck markdown saved to %s", md_path)

        return str(output_path)

    def _create_deck_structure(self, project_data: dict, rubric: dict | None) -> list[dict]:
        """Build the 10-slide deck structure populated with project data."""
        problem = project_data.get("problem_statement", project_data.get("description", ""))
        solution = project_data.get("ai_step", "")
        tech = project_data.get("tech_stack", [])

        deck = []
        for slide_template in PITCH_DECK_SLIDES:
            slide = dict(slide_template)
            if slide["slide"] == 1:
                slide["content"] = f"{problem[:60]}..." if len(problem) > 60 else problem
            elif slide["slide"] == 2:
                slide["content"] = problem
            elif slide["slide"] == 3:
                slide["content"] = solution or problem
            elif slide["slide"] == 5:
                slide["content"] = project_data.get("demo_flow", "Live demo during presentation")
            elif slide["slide"] == 6:
                slide["content"] = ", ".join(tech) if tech else "See architecture"
            deck.append(slide)

        return deck

    async def _generate_demo_script(self, project_data: dict) -> dict:
        """Generate a word-for-word 3-minute demo script."""
        problem = project_data.get("problem_statement", "")
        ai_step = project_data.get("ai_step", "")
        demo_flow = project_data.get("demo_flow", "")

        script_sections = [
            {
                "time": "0:00 - 0:30",
                "section": "Hook",
                "speaker": "Team Lead",
                "text": f"We all know that {problem[:100]}... That's why we built this.",
            },
            {
                "time": "0:30 - 1:00",
                "section": "Problem Deep Dive",
                "speaker": "Team Lead",
                "text": f"Currently, {project_data.get('workflow_before', 'this is done manually')} which means users waste time and get inconsistent results.",
            },
            {
                "time": "1:00 - 2:00",
                "section": "Live Demo",
                "speaker": "Demo Lead",
                "text": f"Let me show you how it works. {demo_flow[:200]}",
            },
            {
                "time": "2:00 - 2:30",
                "section": "AI Deep Dive",
                "speaker": "Tech Lead",
                "text": f"The magic happens here: {ai_step[:150]}",
            },
            {
                "time": "2:30 - 3:00",
                "section": "Closing",
                "speaker": "Team Lead",
                "text": "Here's our impact, our next steps, and why we need your vote. Thank you!",
            },
        ]

        if self.ai:
            prompt = (
                f"Write a word-for-word 3-minute demo script for a hackathon project.\n\n"
                f"Problem: {problem}\n"
                f"AI Solution: {ai_step}\n"
                f"Demo Plan: {demo_flow}\n\n"
                f"Format: Speaker labels, timestamps, and exact words. Natural speaking style."
            )
            try:
                ai_script = str(await self.ai.chat(prompt))
                return {"ai_generated": ai_script, "sections": script_sections}
            except Exception as e:
                logger.warning("AI script generation failed: %s", e)

        return {"sections": script_sections, "total_duration": "3 minutes"}

    def _generate_qa_prep(self, project_data: dict) -> list[dict]:
        """Generate top 10 Q&A questions with answers tailored to the project."""
        qa_list = []
        for qa in QA_QUESTIONS:
            answer = qa["answer_framework"].replace(
                "the AI differentiator",
                f"our use of {project_data.get('ai_step', 'AI')[:80]}",
            )
            qa_list.append({
                "question": qa["question"],
                "answer": answer,
                "preparation_tip": "Have a real example ready",
            })
        return qa_list

    def _write_markdown(self, deck_data: dict, output_dir: Path) -> str:
        """Write the pitch deck as a readable markdown file."""
        lines = ["# Pitch Deck\n"]
        lines.append(f"## Project\n{deck_data['project'].get('problem_statement', '')}\n")

        lines.append("## Slides\n")
        for slide in deck_data["slides"]:
            lines.append(f"### Slide {slide['slide']}: {slide['title']}")
            lines.append(f"- **Content:** {slide['content']}")
            lines.append(f"- **Visual:** {slide['visual_type']}")
            lines.append(f"- **Time:** {slide['duration_seconds']}s")
            lines.append(f"- **Speaker Notes:** {slide['notes']}")
            lines.append("")

        lines.append("## Demo Script\n")
        script = deck_data.get("demo_script", {})
        sections = script.get("sections", [])
        for sec in sections:
            lines.append(f"### {sec['time']} - {sec['section']} ({sec['speaker']})")
            lines.append(sec['text'])
            lines.append("")

        lines.append("## Q&A Prep\n")
        for qa in deck_data.get("qa_prep", []):
            lines.append(f"**Q:** {qa['question']}")
            lines.append(f"**A:** {qa['answer']}")
            lines.append("")

        md_path = output_dir / "pitch_deck.md"
        md_path.write_text("\n".join(lines), encoding="utf-8")
        return str(md_path)
