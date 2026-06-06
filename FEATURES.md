# HackEasy Features

## Legend
- ✅ Base feature (included)
- 🔥 Unique feature (not in HackPilot.io)

## Base Capabilities

1. ✅ **1-click clone to GitHub** - All generated code is auto-committed to a new public/private GitHub repo via the GitHub CLI.
2. ✅ **1-click deploy to Vercel** - After commit, automatically deploy the working app with a single command.
3. ✅ **Pitch deck generator** - Create a 10-slide PowerPoint/PDF deck with graphs, user flows, and impact slides.
4. ✅ **Live demo simulator** - Generate a realistic UI walkthrough video with smooth cursor tracking and cinematic effects.
5. ✅ **Rubric-based optimization** - Parse the hackathon's judging criteria and adapt every decision to maximize scores.
6. ✅ **Multi-duration support** - Dynamically adjust scope for 1h, 2h, 4h, 8h, 12h, 24h, 36h, 48h, or custom duration.
7. ✅ **Hardware integration** - Generate PCB layouts (KiCad), Arduino code, and 3D-printable cases for hardware hackathons.
8. ✅ **Peer voting optimizer** - Analyze voting mechanisms and add social features (likes, comments, share buttons) to maximize votes.
9. ✅ **Track awareness** - Read the track description and build a solution perfectly aligned with sponsor goals.
10. ✅ **Team strength profiling** - Ask each team member for their skills, then assign AI agents to fill the gaps.
11. ✅ **Tech stack selection** - Based on duration and complexity, pick the optimal free stack.
12. ✅ **No exposed API keys** - All keys secured via environment variables and the Hack Club AI proxy.
13. ✅ **MCP server** - Bidirectional communication for Claude Code, OpenCode, or Cursor to control HackEasy.
14. ✅ **Built-in judge simulator** - A second AI role-plays a judge, giving scores and written feedback before submission.
15. ✅ **Iterative improvement loop** - After judge simulation, automatically revise to improve weakest rubric areas.

## Unique Features (Not in HackPilot.io)

16. 🔥 **Context-aware code merging** - Merges AI-generated code with existing project files without overwriting manual changes, preserving git history and hand-written logic.
17. 🔥 **Autonomic deployment rollback** - Detects failed Vercel deployments and automatically rolls back to the last known-good build, notifying the team via Discord.
18. 🔥 **Dynamic prize-tier scoping** - Reads the prize values and categories from Devpost, then tailors the solution complexity to match the highest-value prizes.
19. 🔥 **Sponsor API playground** - Auto-discovers sponsor APIs (Twilio, Stripe, GitHub, etc.) and generates interactive test harnesses so the team can experiment before coding.
20. 🔥 **Auto README generator** - Generates a polished GitHub README with screenshots, architecture diagrams, setup instructions, and a live demo link — updated on every commit.
21. 🔥 **Screenshot-to-code fallback** - If the AI API rate-limits, the user can upload a screenshot of a competing hackathon project and HackEasy reverse-engineers the UI.
22. 🔥 **Multilingual submission adapter** - Translates the entire Devpost submission (description, pictures, video captions) into the hackathon's primary language while preserving technical accuracy.
23. 🔥 **Offline mode with local LLMs** - Detaches from cloud APIs and runs all generation through Ollama-backed local models for air-gapped or unreliable internet scenarios.
24. 🔥 **Time-bank scheduler** - Splits the available hours into AI work blocks, human review blocks, and buffer time, then auto-adjusts when a block runs over.
25. 🔥 **Progressive enhancement mode** - Ships a working MVP in the first 20% of time, then iteratively adds features in order of judged rubric weight.
26. 🔥 **Demo video A/B tester** - Generates three variations of the demo video (fast-cut, narrative, technical deep-dive) and recommends the best one based on the hackathon's format.
27. 🔥 **AI Q&A trainer** - Scrapes the hackathon's FAQ, Discord history, and past winner interviews, then trains a local RAG model so the team can ask "what won last year?" and get instant answers.
28. 🔥 **Auto citation generator** - Every claim in the pitch deck and README gets a real citation from the web, AI-verified for accuracy and linked as a footnote.
29. 🔥 **Design system extractor** - Scrapes the hackathon's official website and extracts colors, fonts, and logos, then applies them to the generated app and deck for brand alignment.
30. 🔥 **Competitive landscape injector** - Searches for other teams building similar projects (via public repos) and automatically differentiates the pitch deck with a comparison slide.
31. 🔥 **Voice-controlled orchestrator** - Accepts voice commands via the CLI microphone integration so teams can say "add a login page" while coding hands-free.
32. 🔥 **Auto boilerplate detector** - Detects when the AI is generating boilerplate code and shortcuts to production-ready implementations from a curated template library.
33. 🔥 **Graceful degradation matrix** - Maps every feature to a duration-based fallback, so if time runs out the least-critical features are stripped without breaking the demo.
34. 🔥 **Devpost auto-filler** - Fills in the Devpost submission form fields (title, description, tech used, collaborators) from the project metadata — one command to submit.
35. 🔥 **Real-time collaboration dashboard** - A Next.js dashboard where all team members see generation progress, logs, and can approve or reject AI outputs before they go live.
36. 🔥 **Prize recommendation engine** - Cross-references the generated project features with every prize category on Devpost and highlights which prizes the project is most likely to win.
37. 🔥 **AI co-presenter notes** - Generates a presenter script with timing cues, demo click-points, and answers to the top 10 likely judge questions.
38. 🔥 **Social media hype kit** - Generates a tweet thread, LinkedIn post, and Instagram story templates with project screenshots and a countdown to judging.
39. 🔥 **Dependency freeze snapshot** - Takes a snapshot of all dependencies at project start so the demo environment is reproducible even if packages are updated mid-hackathon.
40. 🔥 **Custom domain auto-provision** - If the team provides a domain, auto-configures Vercel DNS and provisions a free SSL certificate before deployment.
41. 🔥 **Schema-first data planner** - Before any code is written, generates a full database schema and API contract that the team must approve — preventing mid-project rewrites.
42. 🔥 **Asset pipeline** - Generates app icons, social preview images, favicons, and Open Graph tags in a single pass using the extracted design system.
43. 🔥 **Auto-changing log level** - The orchestrator automatically reduces AI log verbosity as the deadline approaches to reduce cognitive load on the team.
44. 🔥 **Hackathon clock overlay** - A persistent terminal overlay showing remaining time, completed feature count, and current rubric score estimate.
45. 🔥 **Post-hackathon cleanup mode** - After submission, strips hackathon-specific scaffolding, adds production security headers, and deploys a production-ready fork the team can keep building.

## Comparison Table

### HackEasy vs HackPilot.io

| Feature | HackEasy | HackPilot.io |
|---|---|---|
| Open source | ✅ MIT License | ❌ Proprietary |
| Free AI provider | ✅ ai.hackclub.com (free) | ❌ Requires paid API keys |
| Hardware support | ✅ KiCad + Arduino + 3D printing | ❌ Software only |
| MCP server | ✅ Built-in | ❌ Not available |
| Judge simulator | ✅ AI-powered pre-submission review | ❌ Not available |
| Video demo | ✅ Auto-generated with Remotion | ❌ Manual only |
| Offline mode | ✅ Local LLM support | ❌ Cloud-only |
| Voice control | ✅ CLI microphone integration | ❌ Not available |
| Auto Devpost submission | ✅ One-click filler | ❌ Manual copy-paste |
| Collaboration dashboard | ✅ Real-time Next.js dashboard | ❌ Single terminal |
| Prize optimization | ✅ Prize-tier scoping + recommendation | ❌ None |
| Rollback support | ✅ Autonomic deployment rollback | ❌ Manual revert |
| Multilingual support | ✅ Submission translator | ❌ English-only |
| Design system extraction | ✅ Auto from hackathon website | ❌ Manual setup |
| Time-bank scheduler | ✅ Dynamic work-block allocation | ❌ Fixed timer only |
| Offline audio Q&A | ✅ RAG over FAQ + Discord history | ❌ Not available |
| Screenshot-to-code fallback | ✅ Yes | ❌ No |
| Progressive enhancement | ✅ Rubric-weighted feature ordering | ❌ Linear generation |
| Post-hackathon cleanup | ✅ Auto production fork | ❌ None |
| Total features | **45** | **~15** |
| Price | **Free (MIT)** | **$19/month** |
