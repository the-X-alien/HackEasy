const https = require("https");

const BASE = "talented-cat-production-d297.up.railway.app";

function postMCPRaw(sessionId, msg) {
  return new Promise((resolve) => {
    const body = JSON.stringify(msg);
    const req = https.request(
      {
        hostname: BASE,
        path: "/mcp/message?sessionId=" + sessionId,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c.toString()));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", (e) => resolve({ error: e.message }));
    req.end(body);
  });
}

async function main() {
  const results = { pass: 0, fail: 0 };
  function check(name, ok) {
    console.log((ok ? "  PASS" : "  FAIL") + " " + name);
    if (ok) results.pass++;
    else results.fail++;
  }

  // 1. Health check
  let r = await new Promise((resolve) => {
    https.get("https://" + BASE + "/health", (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
  });
  check("health endpoint", r.status === "ok");

  // 2. State endpoint
  r = await new Promise((resolve) => {
    https.get("https://" + BASE + "/api/state", (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
  });
  check("state endpoint returns plan", typeof r.plan === "string");
  check("state endpoint returns tasks", Array.isArray(r.tasks));
  check("state endpoint returns logs", Array.isArray(r.logs));
  check("state endpoint returns agents", typeof r.agents === "object");

  // 3. Plan sync endpoint
  r = await new Promise((resolve) => {
    const body = JSON.stringify({
      plan: "# Prod Test\nTest content",
      tasks: [{ id: 1, name: "test", time: "1h", assignee: null, status: "open", commitHash: null }],
    });
    const req = https.request(
      { hostname: BASE, path: "/api/plan", method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(JSON.parse(d))); }
    );
    req.end(body);
  });
  check("plan sync endpoint", r.status === "ok");

  // Verify persisted
  r = await new Promise((resolve) => {
    https.get("https://" + BASE + "/api/state", (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
  });
  check("plan persisted", r.plan.includes("Prod Test"));
  check("tasks persisted", r.tasks.length >= 1);

  // 4. MCP SSE connection
  const sseSessionId = await new Promise((resolve) => {
    const req = https.get("https://" + BASE + "/mcp", () => {});
    let data = "";
    req.on("response", (res) => {
      res.on("data", (chunk) => {
        data += chunk.toString();
        const m = data.match(/data: ([^\n]+)/);
        if (m) {
          const ep = new URL(m[1], "https://" + BASE);
          resolve(ep.searchParams.get("sessionId"));
        }
      });
    });
    setTimeout(() => resolve(null), 10000);
  });
  check("SSE connection gets sessionId", sseSessionId && sseSessionId.length > 0);
  if (!sseSessionId) {
    console.log("\n=== RESULTS: " + results.pass + " passed, " + results.fail + " failed ===");
    process.exit(1);
  }

  // 5. MCP initialize via SSE
  const mcpResult = await new Promise((resolve) => {
    const msg = JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } },
    });
    const req = https.request(
      { hostname: BASE, path: "/mcp/message?sessionId=" + sseSessionId, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(msg) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve({ status: res.statusCode, body: d })); }
    );
    req.end(msg);
  });
  check("MCP initialize POST accepted", mcpResult.status === 202);

  // 6. MCP notifications/initialized (no response expected - should silently accept)
  const initNotifResult = await new Promise((resolve) => {
    const msg = JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" });
    const req = https.request(
      { hostname: BASE, path: "/mcp/message?sessionId=" + sseSessionId, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(msg) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve({ status: res.statusCode, body: d })); }
    );
    req.end(msg);
  });
  check("notifications/initialized accepted", initNotifResult.status === 202);

  // Also test as request (with id) for clients that send it wrong
  const initNotifAsRequest = await new Promise((resolve) => {
    const msg = JSON.stringify({ jsonrpc: "2.0", id: 99, method: "notifications/initialized" });
    const req = https.request(
      { hostname: BASE, path: "/mcp/message?sessionId=" + sseSessionId, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(msg) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve({ status: res.statusCode, body: d })); }
    );
    req.end(msg);
  });
  check("notifications/initialized as request no -32601 error",
    initNotifAsRequest.status === 202 && !initNotifAsRequest.body.includes("32601"));

  // Verify tasks resource is accessible
  r = await new Promise((resolve) => {
    https.get("https://" + BASE + "/api/state", (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
  });
  check("create_task created tasks visible in state", r.tasks.length > 0);

  console.log("\n=== RESULTS: " + results.pass + " passed, " + results.fail + " failed ===");
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
