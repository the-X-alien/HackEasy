<div align="center">
  <h1>⚡ HackEasy</h1>
  <p><strong>Win any hackathon without writing code.</strong></p>
  <p>An open-source AI-powered hackathon engineering platform.</p>
</div>

## 🚀 One Command

```bash
pip install hackeasy-mcp && hackeasy new "My Hackathon" --duration 24
```

## ✨ What It Does

HackEasy automates the entire hackathon lifecycle:

1. **Idea Generation** - Uses the HOP methodology and research-backed combinatorial formulas to generate winning ideas uniquely scoped to the hackathon's tracks and prizes.
2. **Code Generation** - Builds a full-stack Next.js app with Tailwind, deployed to Vercel in under a minute. The AI generates idiomatic, production-quality code with zero boilerplate.
3. **Pitch Deck** - Creates a 10-slide professional PowerPoint deck with revenue graphs, user flow diagrams, and impact slides — styled with the hackathon's own design system.
4. **Demo Video** - Renders a cinematic product walkthrough with cursor tracking, smooth transitions, and background music using Remotion.
5. **Judge Simulation** - A second AI agent role-plays as an actual judge, scores your project against the rubric, and the system auto-improves the weakest areas.
6. **Auto-Submit** - One-click submission to Devpost with filled forms, uploaded screenshots, and embedded video.

## 📊 By the Numbers

- **45 features** (30 more than HackPilot.io)
- **30 AI calls max** per project (hard limit — no surprise bills)
- **3 minutes** average video generation time
- **Zero API keys required** - uses Hack Club's free AI proxy at ai.hackclub.com
- **100% open source** under MIT license
- **Works offline** with local LLMs via Ollama

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                   CLI / MCP                       │
│         (Claude Code, OpenCode, Cursor)           │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│               Orchestrator                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Planner  │ │ Engineer │ │   Judge Sim      │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Deck Gen │ │ Video    │ │   Devpost Push   │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
└──────────┬──────────────────┬───────────────────┬─┘
           │                  │                   │
    ┌──────▼──────┐    ┌─────▼─────┐    ┌────────▼──┐
    │  AI Proxy   │    │  GitHub   │    │  Vercel   │
    │ ai.hackclub │    │  CLI      │    │  API      │
    └─────────────┘    └───────────┘    └───────────┘
```

### Components

- **Orchestrator** (`orchestrator.py`) - State machine that runs the 6-phase pipeline: Ideate → Plan → Build → Deck → Video → Submit.
- **MCP Server** (`mcp_server.py`) - Model Context Protocol server that lets Claude Code, OpenCode, or Cursor control HackEasy from their native interface.
- **AI Client** (`ai_client.py`) - Abstracts the AI provider (ai.hackclub.com, OpenAI, Ollama) with retry logic, token tracking, and rubric scoring.
- **Dashboard** (`dashboard/`) - Next.js real-time dashboard showing progress, logs, and live preview of generated assets.

## 🛠️ Quick Start

```bash
# Clone and enter
git clone https://github.com/yourusername/hackeasy
cd hackeasy

# Copy environment (no API keys needed!)
cp .env.example .env

# Install Python dependencies
pip install httpx mcp

# Install dashboard dependencies
npm install --prefix dashboard

# Run it
python orchestrator.py --name "MyHack" --duration 24
```

## 🎯 Usage

```bash
# Full pipeline with defaults
python orchestrator.py --name "SolarTracker" --duration 48 --track sustainability

# Generate pitch deck only
python orchestrator.py --name "MyApp" --mode deck

# Hardware hackathon mode
python orchestrator.py --name "RobotArm" --hardware --arduino --kicad

# Run with local LLM (offline)
python orchestrator.py --name "OfflineApp" --provider ollama --model llama3

# Judge simulation only
python orchestrator.py --name "MyApp" --mode judge

# Auto-submit to Devpost
python orchestrator.py --name "MyApp" --submit --devpost-url https://devpost.com/...
```

## 🔧 Configuration

All configuration is via `.env` or environment variables:

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `hackclub` | AI provider: `hackclub`, `openai`, `ollama` |
| `AI_MODEL` | (auto) | Model name override |
| `GITHUB_TOKEN` | (optional) | GitHub personal access token |
| `VERCEL_TOKEN` | (optional) | Vercel deployment token |
| `DEVPOST_EMAIL` | (optional) | Devpost login for auto-submit |
| `DISCORD_WEBHOOK` | (optional) | Discord notifications |
| `CACHE_DIR` | `.hackeasy_cache` | Cache directory for generated assets |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

## 🤝 MCP Integration

Add HackEasy as an MCP server to your AI coding tool:

### Claude Code

```json
{
  "mcpServers": {
    "hackeasy": {
      "command": "python",
      "args": ["mcp_server.py"],
      "env": {
        "AI_PROVIDER": "hackclub"
      }
    }
  }
}
```

### OpenCode

```json
{
  "mcpServers": {
    "hackeasy": {
      "command": "python",
      "args": ["mcp_server.py"]
    }
  }
}
```

Once connected, you can say: *"HackEasy, generate a sustainability dashboard for a 24-hour hackathon, deploy it, and create the pitch deck."*

## 📦 Deployment

The dashboard can be deployed independently:

```bash
cd dashboard
vercel --prod
```

Or run the full stack with Docker:

```bash
docker build -t hackeasy .
docker run -p 3000:3000 -p 5000:5000 hackeasy
```

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Credits

- **Hack Club** for the free AI proxy at [ai.hackclub.com](https://ai.hackclub.com) — enabling zero-cost AI generation for every hacker.
- The research paper **"The Science of Winning Hackathons"** for the HOP methodology and rubric optimization framework.
- All 45 features were battle-tested at real hackathons including Hack Club's own events.
