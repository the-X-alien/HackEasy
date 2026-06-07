const https = require("https");

const MCP_HOST = "talented-cat-production-d297.up.railway.app";
const AI_API = "https://ai.hackclub.com/proxy/v1/chat/completions";

let sessionId = null;
let sseRes = null;
let reqId = 0;
let pending = {};

function sseConnect() {
  return new Promise((resolve, reject) => {
    https.get("https://" + MCP_HOST + "/mcp", { headers: { Accept: "text/event-stream" } }, (res) => {
      sseRes = res;
      let buf = "";
      res.on("data", (chunk) => {
        buf += chunk.toString();
        // Check for endpoint event first
        if (!sessionId) {
          const m = buf.match(/data: ([^\n]+)/);
          if (m) {
            sessionId = new URL(m[1].trim(), "http://x").searchParams.get("sessionId");
            resolve(sessionId);
          }
        }
        // Process SSE message events (responses)
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("data: ")) {
            try {
              const msg = JSON.parse(lines[i].slice(6));
              const id = msg.id;
              if (id !== undefined && pending[id]) {
                pending[id](msg);
                delete pending[id];
              }
            } catch {}
          }
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function postMessage(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++reqId;
    const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    const path = "/mcp/message?sessionId=" + sessionId;
    pending[id] = resolve;
    const timeout = setTimeout(() => {
      delete pending[id];
      reject(new Error("Timeout waiting for response (method: " + method + ")"));
    }, 15000);
    const req = https.request(
      { hostname: MCP_HOST, method: "POST", path, headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode !== 202) {
            clearTimeout(timeout);
            delete pending[id];
            reject(new Error("HTTP " + res.statusCode + ": " + data));
          }
        });
      }
    );
    req.on("error", (e) => {
      clearTimeout(timeout);
      delete pending[id];
      reject(e);
    });
    req.write(body);
    req.end();
  });
}

function aiGenerate(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a hackathon planning expert. Be concise and practical." },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
    });
    const req = https.request(
      AI_API,
      { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + (process.env.AI_API_KEY || "") } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(data);
            resolve(j.choices?.[0]?.message?.content || "(AI returned empty)");
          } catch {
            resolve("[Fallback] Build a real-time study group app with Next.js, WebSocket quizzes, and live progress tracking.");
          }
        });
      }
    );
    req.on("error", () => resolve("[Fallback] Build a real-time collaborative whiteboard app for hackathon brainstorming."));
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function show(raw) {
  if (!raw) return "(empty)";
  const txt = raw.result?.content?.[0]?.text || raw.content?.[0]?.text || JSON.stringify(raw).substring(0, 200);
  return txt;
}

async function main() {
  console.log("\x1b[36m╔══════════════════════════════════════════════╗");
  console.log("║     HackEasy MCP Agent Demo Workflow       ║");
  console.log("╚══════════════════════════════════════════════╝\x1b[0m");

  console.log("\n\x1b[33m▸ 1. Connect to MCP Server\x1b[0m");
  await sseConnect();
  console.log("   ✓ Connected. Session:", sessionId);

  console.log("\n\x1b[33m▸ 2. Read Current Plan from MCP\x1b[0m");
  let r = await postMessage("resources/read", { uri: "hackathon://plan" });
  let planText = r?.result?.contents?.[0]?.text || "(empty)";
  console.log("   " + planText.substring(0, 200));

  console.log("\n\x1b[33m▸ 3. Read Rubric\x1b[0m");
  r = await postMessage("resources/read", { uri: "hackathon://rubric" });
  console.log("   " + show(r).substring(0, 200));

  console.log("\n\x1b[33m▸ 4. Register as Agent: opencode-demo\x1b[0m");
  r = await postMessage("tools/call", { name: "register_agent", arguments: { agent_id: "opencode-demo", agent_type: "opencode" } });
  console.log("   " + show(r));

  console.log("\n\x1b[33m▸ 5. Generate Hackathon Idea (AI)\x1b[0m");
  const idea = await aiGenerate(
    "Give me ONE specific hackathon project idea for a 24h event. Format: **Project Name** - 2 sentence description. Must be buildable in 24h with Next.js + Tailwind."
  );
  console.log("   " + idea);

  console.log("\n\x1b[33m▸ 6. Update Plan on MCP\x1b[0m");
  r = await postMessage("tools/call", { name: "update_plan", arguments: { section: "Project Idea", content: idea } });
  console.log("   " + show(r));

  const planMd = `
## Build Plan
1. Scaffold Next.js project with Tailwind
2. Build core pages (home, dashboard, settings)
3. Implement API routes for data
4. Add authentication (NextAuth)
5. Polish UI + responsive design
6. Deploy to Vercel
7. Create demo video + slides
8. Submit to Devpost
  `.trim();
  r = await postMessage("tools/call", { name: "update_plan", arguments: { section: "Execution Plan", content: planMd } });
  console.log("   " + show(r));

  console.log("\n\x1b[33m▸ 7. Agent Claims Tasks (claim_next_task)\x1b[0m");
  r = await postMessage("tools/call", { name: "claim_next_task", arguments: { agent_id: "opencode-demo" } });
  console.log("   " + show(r).substring(0, 150));

  r = await postMessage("tools/call", { name: "claim_next_task", arguments: { agent_id: "opencode-demo" } });
  console.log("   " + show(r).substring(0, 150));

  console.log("\n\x1b[33m▸ 8. Mark Tasks Complete\x1b[0m");
  r = await postMessage("tools/call", { name: "mark_task_done", arguments: { task_id: 1, commit_hash: "a1b2c3d" } });
  console.log("   " + show(r));

  r = await postMessage("tools/call", { name: "mark_task_done", arguments: { task_id: 2, commit_hash: "e4f5g6h" } });
  console.log("   " + show(r));

  console.log("\n\x1b[33m▸ 9. Update Repo\x1b[0m");
  r = await postMessage("tools/call", { name: "update_repo", arguments: { url: "https://github.com/the-X-alien/HackEasy", commit_sha: "e4f5g6h" } });
  console.log("   " + show(r));

  console.log("\n\x1b[33m▸ 10. Generate Assets\x1b[0m");
  r = await postMessage("tools/call", { name: "generate_slides", arguments: { template_style: "dark-premium" } });
  const slidesStatus = r?.result?.content?.[0]?.text || "";
  console.log("   ✓ Slides: " + JSON.parse(slidesStatus)?.status || "generated");

  r = await postMessage("tools/call", { name: "draft_devpost", arguments: {} });
  console.log("   ✓ Devpost draft generated");

  console.log("\n\x1b[33m▸ 11. Add Activity Log Entry\x1b[0m");
  r = await postMessage("tools/call", { name: "add_log", arguments: { agent_id: "opencode-demo", message: "Agent demo completed successfully — all phases executed." } });
  console.log("   " + show(r));

  console.log("\n\x1b[33m▸ 12. Run Judge Simulator\x1b[0m");
  r = await postMessage("tools/call", { name: "run_judge_simulator", arguments: {} });
  console.log("   Scores: " + show(r));

  console.log("\n\x1b[33m▸ 13. Read Final State\x1b[0m");
  r = await postMessage("resources/read", { uri: "hackathon://plan" });
  console.log("\n   Final Plan on MCP:\n   " + (r?.result?.contents?.[0]?.text || "").substring(0, 400));

  r = await postMessage("resources/read", { uri: "hackathon://logs" });
  const logCount = r?.result?.contents?.[0]?.text ? JSON.parse(r.result.contents[0].text).length : 0;
  console.log("\n   Activity Log: " + logCount + " entries logged to MCP");

  r = await postMessage("resources/read", { uri: "hackathon://slides" });
  console.log("   Slides: " + (r?.result?.contents?.[0]?.text || "none"));

  sseRes.destroy();

  console.log("\n\x1b[32m╔══════════════════════════════════════════════╗");
  console.log("║         Full MCP Agent Cycle Complete!      ║");
  console.log("╚══════════════════════════════════════════════╝\x1b[0m");
  console.log("   Dashboard: https://dashboard-green-seven-64.vercel.app/dashboard");
  console.log("   MCP Server: https://talented-cat-production-d297.up.railway.app");
  console.log("\n   ✓ All 13 phases executed via SSE transport");
  console.log("   ✓ Plan, tasks, logs, slides, devpost all persisted");
  console.log("   ✓ Any agent can connect with:");
  console.log("     opencode --mcp https://talented-cat-production-d297.up.railway.app/mcp");
}

main().catch((e) => {
  console.error("✗ Error:", e.message);
  sseRes?.destroy();
  process.exit(1);
});
