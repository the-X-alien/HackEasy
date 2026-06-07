const http = require("http");
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  PingRequestSchema,
  InitializedNotificationSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const fs = require("fs");
const path = require("path");

const STATE_FILE = path.resolve("./hackeasy-state.json");
const MAX_LOG_ENTRIES = 200;

function defaultState() {
  return {
    plan: "# Hackathon Plan\n\nDuration: 24h\nTrack: Open\n",
    tasks: [],
    rubric: {
      innovation: 0.25,
      technical: 0.25,
      impact: 0.2,
      presentation: 0.15,
      feasibility: 0.15,
    },
    logs: [],
    repo: { url: null, currentSha: null },
    slides: null,
    video: null,
    devpost: null,
    agents: {},
  };
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      return { ...defaultState(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error(`[hackeasy] Failed to load state: ${e.message}`);
  }
  return defaultState();
}

function saveState(state) {
  try {
    if (state.logs.length > MAX_LOG_ENTRIES) {
      state.logs = state.logs.slice(-MAX_LOG_ENTRIES);
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error(`[hackeasy] Failed to save state: ${e.message}`);
  }
}

function addLog(state, agent, message) {
  state.logs.push({ ts: new Date().toISOString(), agent, message });
}

const TOOL_DEFINITIONS = [
  {
    name: "update_plan",
    description: "Update the hackathon plan",
    inputSchema: {
      type: "object",
      properties: {
        section: { type: "string", description: "Plan section to update" },
        content: { type: "string", description: "New content for the section" },
      },
      required: ["section", "content"],
    },
  },
  {
    name: "assign_task",
    description: "Assign a task to an agent",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID" },
        agent_id: { type: "string", description: "Agent identifier" },
      },
      required: ["task_id", "agent_id"],
    },
  },
  {
    name: "claim_next_task",
    description: "Auto-assign the next open unassigned task to an agent",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent identifier" },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "mark_task_done",
    description: "Mark a task as complete with commit hash",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID" },
        commit_hash: { type: "string", description: "Git commit hash" },
      },
      required: ["task_id", "commit_hash"],
    },
  },
  {
    name: "create_task",
    description: "Add a new task to the task list",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Task name/title" },
        time: { type: "string", description: "Estimated time (e.g. 1h, 45m)" },
        assignee: { type: "string", description: "Optional agent to assign to" },
      },
      required: ["name"],
    },
  },
  {
    name: "register_agent",
    description: "Register an agent as connected",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent identifier" },
        agent_type: { type: "string", description: "Agent type (e.g. opencode, claude-code)" },
      },
      required: ["agent_id", "agent_type"],
    },
  },
  {
    name: "unregister_agent",
    description: "Remove an agent from the connected list",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent identifier" },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "add_log",
    description: "Add a log entry",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent identifier" },
        message: { type: "string", description: "Log message" },
      },
      required: ["agent_id", "message"],
    },
  },
  {
    name: "update_repo",
    description: "Update repository URL and/or commit SHA",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Repository URL" },
        commit_sha: { type: "string", description: "Current commit SHA" },
      },
    },
  },
  {
    name: "generate_slides",
    description: "Generate presentation slides",
    inputSchema: {
      type: "object",
      properties: {
        template_style: { type: "string", description: "Slide template style" },
      },
    },
  },
  {
    name: "render_video",
    description: "Render a demo video",
    inputSchema: {
      type: "object",
      properties: {
        style: { type: "string", description: "Video style" },
        duration_seconds: { type: "number", description: "Video duration in seconds" },
      },
    },
  },
  {
    name: "draft_devpost",
    description: "Generate a Devpost draft",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "run_judge_simulator",
    description: "Run judge simulation and return mock scores",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

function createServer() {
  const server = new Server(
    { name: "hackeasy-mcp", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {} } }
  );

  server.setNotificationHandler(InitializedNotificationSchema, () => {});

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      { uri: "hackathon://plan", name: "Hackathon Plan", mimeType: "text/markdown" },
      { uri: "hackathon://tasks", name: "Tasks", mimeType: "application/json" },
      { uri: "hackathon://rubric", name: "Rubric", mimeType: "application/json" },
      { uri: "hackathon://repo", name: "Repository Info", mimeType: "application/json" },
      { uri: "hackathon://logs", name: "Activity Logs", mimeType: "application/json" },
      { uri: "hackathon://slides", name: "Slides", mimeType: "application/json" },
      { uri: "hackathon://video", name: "Video", mimeType: "application/json" },
      { uri: "hackathon://devpost", name: "Devpost Draft", mimeType: "application/json" },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const state = loadState();
    const uri = request.params.uri;
    const resourceMap = {
      "hackathon://plan": { text: state.plan, mimeType: "text/markdown" },
      "hackathon://tasks": { text: JSON.stringify(state.tasks, null, 2), mimeType: "application/json" },
      "hackathon://rubric": { text: JSON.stringify(state.rubric, null, 2), mimeType: "application/json" },
      "hackathon://repo": { text: JSON.stringify(state.repo, null, 2), mimeType: "application/json" },
      "hackathon://logs": { text: JSON.stringify(state.logs, null, 2), mimeType: "application/json" },
      "hackathon://slides": { text: JSON.stringify(state.slides, null, 2), mimeType: "application/json" },
      "hackathon://video": { text: JSON.stringify(state.video, null, 2), mimeType: "application/json" },
      "hackathon://devpost": { text: JSON.stringify(state.devpost, null, 2), mimeType: "application/json" },
    };
    const entry = resourceMap[uri];
    if (!entry) throw new Error(`Unknown resource: ${uri}`);
    return { contents: [{ uri, mimeType: entry.mimeType, text: entry.text }] };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const state = loadState();
    const tool = request.params.name;
    const args = request.params.arguments || {};

    try {
      let result;

      switch (tool) {
        case "update_plan": {
          const { section, content } = args;
          state.plan = state.plan + `\n\n## ${section}\n\n${content}`;
          addLog(state, "system", `Plan section "${section}" updated`);
          result = { content: [{ type: "text", text: `Plan section "${section}" updated.` }] };
          break;
        }

        case "create_task": {
          const { name, time, assignee } = args;
          if (!name || typeof name !== "string") throw new Error("Task name is required");
          const maxId = state.tasks.reduce((m, t) => Math.max(m, t.id), 0);
          const newTask = { id: maxId + 1, name, time: time || "1h", assignee: assignee || null, status: "open", commitHash: null };
          state.tasks.push(newTask);
          addLog(state, assignee || "system", `Task #${newTask.id} created: "${name}"`);
          result = { content: [{ type: "text", text: JSON.stringify(newTask) }] };
          break;
        }

        case "assign_task": {
          const { task_id, agent_id } = args;
          if (task_id === undefined) throw new Error("task_id is required");
          if (!agent_id) throw new Error("agent_id is required");
          const task = state.tasks.find((t) => t.id === task_id);
          if (!task) throw new Error(`Task ${task_id} not found`);
          if (task.assignee !== null) throw new Error(`Task ${task_id} is already assigned to ${task.assignee}`);
          task.assignee = agent_id;
          task.status = "in_progress";
          addLog(state, agent_id, `Assigned to task #${task_id}: "${task.name}"`);
          result = { content: [{ type: "text", text: `Task #${task_id} assigned to ${agent_id}.` }] };
          break;
        }

        case "claim_next_task": {
          const { agent_id } = args;
          if (!agent_id) throw new Error("agent_id is required");
          const nextTask = state.tasks.find((t) => t.assignee === null && t.status === "open");
          if (!nextTask) {
            result = { content: [{ type: "text", text: "null" }] };
            break;
          }
          nextTask.assignee = agent_id;
          nextTask.status = "in_progress";
          addLog(state, agent_id, `Claimed next task #${nextTask.id}: "${nextTask.name}"`);
          result = { content: [{ type: "text", text: JSON.stringify(nextTask) }] };
          break;
        }

        case "mark_task_done": {
          const { task_id, commit_hash } = args;
          if (task_id === undefined) throw new Error("task_id is required");
          if (!commit_hash) throw new Error("commit_hash is required");
          const task = state.tasks.find((t) => t.id === task_id);
          if (!task) throw new Error(`Task ${task_id} not found`);
          task.status = "done";
          task.commitHash = commit_hash;
          addLog(state, task.assignee || "unknown", `Completed task #${task_id}: "${task.name}" (${commit_hash})`);
          result = { content: [{ type: "text", text: `Task #${task_id} marked done (${commit_hash}).` }] };
          break;
        }

        case "register_agent": {
          const { agent_id, agent_type } = args;
          if (!agent_id) throw new Error("agent_id is required");
          if (!agent_type) throw new Error("agent_type is required");
          state.agents[agent_id] = { type: agent_type, connectedAt: new Date().toISOString() };
          addLog(state, agent_id, `Agent registered (${agent_type})`);
          result = { content: [{ type: "text", text: `Agent ${agent_id} (${agent_type}) registered.` }] };
          break;
        }

        case "unregister_agent": {
          const { agent_id } = args;
          if (!agent_id) throw new Error("agent_id is required");
          if (!state.agents[agent_id]) throw new Error(`Agent ${agent_id} not found`);
          delete state.agents[agent_id];
          addLog(state, agent_id, `Agent unregistered`);
          result = { content: [{ type: "text", text: `Agent ${agent_id} unregistered.` }] };
          break;
        }

        case "add_log": {
          const { agent_id, message } = args;
          if (!agent_id) throw new Error("agent_id is required");
          if (!message) throw new Error("message is required");
          addLog(state, agent_id, message);
          result = { content: [{ type: "text", text: "Log entry added." }] };
          break;
        }

        case "update_repo": {
          const { url, commit_sha } = args;
          if (url !== undefined) state.repo.url = url;
          if (commit_sha !== undefined) state.repo.currentSha = commit_sha;
          addLog(state, "system", `Repo updated (url=${url || "unchanged"}, sha=${commit_sha || "unchanged"})`);
          result = { content: [{ type: "text", text: "Repository info updated." }] };
          break;
        }

        case "generate_slides": {
          const { template_style } = args;
          state.slides = { status: "generating...", template_style: template_style || "default", instructions: "Use Slidev (slidev.io) or Marp (marp.app) to generate slides.", generatedAt: new Date().toISOString() };
          addLog(state, "system", `Slides generation started (style: ${template_style || "default"})`);
          result = { content: [{ type: "text", text: JSON.stringify(state.slides, null, 2) }] };
          break;
        }

        case "render_video": {
          const { style, duration_seconds } = args;
          state.video = { status: "queued", style: style || "default", duration_seconds: duration_seconds || 60, instructions: "Use screen recording or ffmpeg for assembly.", generatedAt: new Date().toISOString() };
          addLog(state, "system", `Video render queued (style: ${style || "default"}, ${duration_seconds || 60}s)`);
          result = { content: [{ type: "text", text: JSON.stringify(state.video, null, 2) }] };
          break;
        }

        case "draft_devpost": {
          const draft = { title: "HackEasy Project", tagline: "AI-powered hackathon automation", summary: "Built with HackEasy.", link: state.repo.url || "https://github.com/", submittedAt: null };
          state.devpost = draft;
          addLog(state, "system", "Devpost draft generated");
          result = { content: [{ type: "text", text: JSON.stringify(draft, null, 2) }] };
          break;
        }

        case "run_judge_simulator": {
          const { rubric } = state;
          const scores = {};
          let total = 0;
          for (const [criterion, weight] of Object.entries(rubric)) {
            const score = Math.round((Math.random() * 3 + 7) * 10) / 10;
            scores[criterion] = { score, weight, weighted: +(score * weight).toFixed(2) };
            total += scores[criterion].weighted;
          }
          scores.total = +total.toFixed(2);
          addLog(state, "system", "Judge simulation run");
          result = { content: [{ type: "text", text: JSON.stringify(scores, null, 2) }] };
          break;
        }

        default:
          throw new Error(`Unknown tool: ${tool}`);
      }

      saveState(state);
      return result;
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  });

  return server;
}

// --- HTTP Server with SSE Transport ---

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

function json(res, status, data) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const transports = {};

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const start = Date.now();
  const logReq = () => {
    const ms = Date.now() - start;
    console.error(`[${new Date().toISOString()}] ${req.method} ${url.pathname} ${res.statusCode} ${ms}ms`);
  };

  // CORS preflight
  if (req.method === "OPTIONS") {
    json(res, 204, "");
    return;
  }

  if (req.method === "GET" && url.pathname === "/mcp") {
    const transport = new SSEServerTransport("/mcp/message", res);
    transports[transport.sessionId] = transport;
    transport.onclose = () => {
      delete transports[transport.sessionId];
    };
    const server = createServer();
    await server.connect(transport);
    logReq();
    return;
  }

  if (req.method === "POST" && url.pathname === "/mcp/message") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = transports[sessionId];
    if (!transport) {
      json(res, 404, { error: "Session not found" });
      logReq();
      return;
    }
    await transport.handlePostMessage(req, res);
    logReq();
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/plan") {
    try {
      const data = await parseJSONBody(req);
      const state = loadState();
      if (data.plan !== undefined) state.plan = data.plan;
      if (data.tasks !== undefined) state.tasks = data.tasks;
      if (data.rubric !== undefined) state.rubric = data.rubric;
      saveState(state);
      json(res, 200, { status: "ok" });
    } catch (e) {
      json(res, 400, { error: e.message });
    }
    logReq();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    const state = loadState();
    json(res, 200, state);
    logReq();
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, { status: "ok", sessions: Object.keys(transports).length });
    logReq();
    return;
  }

  json(res, 404, { error: "Not found" });
  logReq();
});

const PORT = process.env.PORT || 3100;
httpServer.listen(PORT, () => {
  console.error(`HackEasy MCP Server v1.0.0 (SSE)`);
  console.error(`SSE endpoint: GET /mcp`);
  console.error(`Message endpoint: POST /mcp/message`);
  console.error(`Health: GET /health`);
  console.error(`Port: ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.error("SIGTERM received, shutting down...");
  for (const t of Object.values(transports)) {
    try { t.close(); } catch {}
  }
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.error("SIGINT received, shutting down...");
  for (const t of Object.values(transports)) {
    try { t.close(); } catch {}
  }
  httpServer.close(() => process.exit(0));
});
