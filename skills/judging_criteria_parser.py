import re
import sys
import json


def parse_rubric(rubric_text: str) -> dict:
    lines = rubric_text.strip().splitlines()
    categories = {}
    current_cat = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        weight_match = re.match(
            r"^[*-]?\s*\*{0,2}(.+?)\*{0,2}\s*[(-]?\s*(\d{1,3})\s*%?\s*[)-]?\s*",
            line,
            re.IGNORECASE,
        )
        if weight_match:
            name = weight_match.group(1).strip().rstrip(":")
            weight = int(weight_match.group(2))
            categories[name] = {"weight": weight, "description": line}
            current_cat = name
        elif current_cat:
            categories[current_cat]["description"] += " " + line

    if not categories:
        fallback = {
            "Innovation": {"weight": 25, "description": ""},
            "Impact": {"weight": 25, "description": ""},
            "Technical Complexity": {"weight": 25, "description": ""},
            "Polish & Design": {"weight": 25, "description": ""},
        }
        for line in lines:
            for key in fallback:
                if key.lower() in line.lower():
                    fallback[key]["description"] += " " + line
        categories = fallback

    total_weight = sum(c["weight"] for c in categories.values())
    if total_weight != 100:
        for c in categories.values():
            c["weight"] = round(c["weight"] / total_weight * 100)

    return categories


def optimize_for_rubric(project_description: str, rubric: dict) -> list[str]:
    tips = []
    desc_lower = project_description.lower()

    for category, info in rubric.items():
        cat_lower = category.lower()
        if info["weight"] >= 30:
            tips.append(
                f"Prioritize '{category}' ({info['weight']}%) — allocate at least half your time here."
            )

        if any(kw in cat_lower for kw in ["innovation", "creativity", "novelty"]):
            if not any(
                kw in desc_lower
                for kw in ["novel", "unique", "new approach", "innovative", "first"]
            ):
                tips.append(
                    f"Strengthen '{category}' — explicitly frame what makes this novel."
                )

        if any(
            kw in cat_lower for kw in ["impact", "practical", "usefulness", "value"]
        ):
            if not any(
                kw in desc_lower
                for kw in ["impact", "solve", "users", "real-world", "scale"]
            ):
                tips.append(
                    f"Strengthen '{category}' — quantify user impact or real-world applicability."
                )

        if any(
            kw in cat_lower
            for kw in ["technical", "complexity", "difficulty", "challenge"]
        ):
            if not any(
                kw in desc_lower
                for kw in [
                    "architecture",
                    "pipeline",
                    "infrastructure",
                    "model",
                    "algorithm",
                ]
            ):
                tips.append(
                    f"Strengthen '{category}' — highlight architectural or algorithmic depth."
                )

        if any(
            kw in cat_lower
            for kw in ["polish", "design", "ui", "ux", "presentation", "aesthetic"]
        ):
            if not any(
                kw in desc_lower
                for kw in ["polished", "clean ui", "responsive", "design", "animations"]
            ):
                tips.append(
                    f"Strengthen '{category}' — mention UI polish, animations, or responsive design."
                )

    if not tips:
        tips.append(
            "Align your demo narrative to the highest-weighted rubric categories."
        )

    return tips


def simulate_judging(project_description: str, rubric: dict) -> dict:
    scores = {}
    total = 0.0
    base = len(project_description.split()) / 50
    base = min(base, 10.0)

    for category, info in rubric.items():
        cat_lower = category.lower()
        score = base * 0.6

        if any(
            kw in cat_lower
            for kw in ["innovation", "creativity", "novelty", "originality"]
        ):
            score += 2.0
        if any(
            kw in cat_lower
            for kw in ["impact", "practical", "usefulness", "value", "relevance"]
        ):
            score += 1.5
        if any(
            kw in cat_lower
            for kw in ["technical", "complexity", "difficulty", "challenge"]
        ):
            score += 1.0
        if any(
            kw in cat_lower
            for kw in ["polish", "design", "ui", "ux", "presentation", "aesthetic"]
        ):
            score += 0.5

        score = max(0, min(10, round(score, 1)))
        scores[category] = {"score": score, "weight": info["weight"]}
        total += score * (info["weight"] / 100)

    total = round(total, 2)
    return {"scores": scores, "total": total}


def score_to_verdict(score: float) -> str:
    if score >= 9.0:
        return "🏆 Top contender — strong chance at winning overall"
    elif score >= 7.5:
        return "🥇 Strong contender — likely top 3 in category"
    elif score >= 6.0:
        return "🥈 Solid entry — could place if demo is compelling"
    elif score >= 4.0:
        return "🥉 Middle of the pack — needs a stronger hook or demo"
    elif score >= 2.0:
        return "⚠️ Needs significant work — consider scope reduction"
    else:
        return "❌ Unlikely to place — revisit the core idea or execution"


def main():
    print("=== HackEasy Judging Criteria Parser ===\n")
    print("Paste judging rubric text (Ctrl+Z then Enter to finish):")
    rubric_text = sys.stdin.read()

    rubric = parse_rubric(rubric_text)
    print("\n--- Parsed Rubric ---")
    print(json.dumps(rubric, indent=2))

    desc = input("\nEnter a brief project description: ")
    tips = optimize_for_rubric(desc, rubric)
    print("\n--- Optimization Tips ---")
    for t in tips:
        print(f"  • {t}")

    sim = simulate_judging(desc, rubric)
    print(f"\n--- Simulated Score: {sim['total']}/10 ---")
    for cat, data in sim["scores"].items():
        bar = "#" * int(data["score"]) + "-" * (10 - int(data["score"]))
        print(f"  {cat}: [{bar}] {data['score']}/10 ({data['weight']}%)")
    print(f"\nVerdict: {score_to_verdict(sim['total'])}")


if __name__ == "__main__":
    main()
