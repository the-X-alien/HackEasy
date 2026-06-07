import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'

const DURATIONS = [1, 2, 4, 8, 12, 24, 36, 48]
const COMMON_STACKS = ['Next.js', 'Python', 'Flutter', 'React', 'Hardware', 'Go', 'Rust', 'TypeScript']

const AGENT_NAMES = ['Agent A (OpenCode)', 'Agent B (Claude Code)', 'Agent C (Codex CLI)']
const AGENT_TYPES = ['OpenCode', 'Claude Code', 'Codex CLI']
const STATUS_ORDER = { open: 0, 'in-progress': 1, done: 2 }

const SAMPLE_TASKS = [
  { id: 1, name: 'Set up project scaffolding', time: '45m', assignee: '', status: 'done', commitHash: '3f2a1b' },
  { id: 2, name: 'Configure authentication & auth flow', time: '2h', assignee: '', status: 'in-progress', commitHash: '' },
  { id: 3, name: 'Build core API routes', time: '2h', assignee: '', status: 'open', commitHash: '' },
  { id: 4, name: 'Create main UI components', time: '2.5h', assignee: '', status: 'open', commitHash: '' },
  { id: 5, name: 'Implement data persistence layer', time: '1.5h', assignee: '', status: 'open', commitHash: '' },
  { id: 6, name: 'Write tests for critical paths', time: '1h', assignee: '', status: 'open', commitHash: '' },
  { id: 7, name: 'Prepare demo script', time: '30m', assignee: '', status: 'open', commitHash: '' },
  { id: 8, name: 'Final polish and bug fixes', time: '1h', assignee: '', status: 'open', commitHash: '' },
]

let taskIdCounter = 8

function SparkleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function StatusDot({ status }) {
  const colors = { connected: 'bg-green-400', idle: 'bg-amber-400', disconnected: 'bg-gray-600' }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-gray-600'}`} />
}

function parseMarkdown(md) {
  if (!md) return ''
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-[#8A61FF] mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-[#8A61FF] mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold font-mono mt-5 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="text-sm text-gray-300 ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-gray-400 leading-relaxed mb-2">')
  return `<p class="text-sm text-gray-400 leading-relaxed mb-2">${html}</p>`
}

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[rgb(15,23,42)]/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#8A61FF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-lg font-bold font-mono">HackEasy</span>
          <span className="hidden sm:inline text-sm text-gray-500 ml-2">/ Orchestration Hub</span>
        </div>
        <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </a>
      </div>
    </nav>
  )
}

function ConfigForm({ onSubmit }) {
  const [config, setConfig] = useState({ name: '', duration: 24, track: '', team: '', tech: '' })
  const [suggestingTrack, setSuggestingTrack] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  const suggestTrack = async () => {
    if (!config.name.trim()) { toast.error('Enter a hackathon name first'); return }
    setSuggestingTrack(true)
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'suggest-track', config: { name: config.name } }),
      })
      const data = await res.json()
      const suggested = data.track || (data.suggestions && data.suggestions[0])
      if (suggested) { update('track', suggested); toast.success(`Suggested track: ${suggested}`) }
    } catch {
      const tracks = ['AI/ML Innovation', 'Social Impact', 'Developer Tools', 'Health Tech', 'EdTech']
      const t = tracks[Math.floor(Math.random() * tracks.length)]
      update('track', t)
      toast.success(`Suggested track: ${t}`)
    }
    setSuggestingTrack(false)
  }

  const addStack = (stack) => {
    const current = config.tech ? config.tech.split(',').map(s => s.trim()).filter(Boolean) : []
    if (current.includes(stack)) { toast.error(`${stack} already added`); return }
    current.push(stack)
    update('tech', current.join(', '))
  }

  const handleSubmit = async () => {
    if (!config.name.trim()) { toast.error('Enter a hackathon name'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'generate-plan', config }),
      })
      const data = await res.json()
      onSubmit(config, data.plan || data.markdown || '# Plan generated\n\nYour project plan has been created.')
    } catch {
      const fallback = `# ${config.name} - Project Plan

**Duration:** ${config.duration}h
**Track:** ${config.track || 'Open Track'}
**Team:** ${config.team || 'TBD'}
**Tech Stack:** ${config.tech || 'TBD'}

## Scope

Build a working prototype that demonstrates the core idea. Focus on functionality over polish.

## MVP Tiers

- **Tier 1 (T/4):** Core feature working end-to-end
- **Tier 2 (T/2):** Edge cases handled, basic UI polish
- **Tier 3 (3T/4):** Tests, error states, loading states
- **Tier 4 (Ship):** Demo script, pitch ready, devpost drafted

## Key Decisions

- Use familiar tech stack to minimize ramp-up time
- Ship early, iterate fast — no premature optimization
- Demo must work 100% — prioritize reliability over features`
      onSubmit(config, fallback)
    }
    setSubmitting(false)
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold font-mono mb-1">Configure Your Project</h2>
        <p className="text-sm text-gray-400 mb-6">Set up your hackathon profile. HackEasy generates a plan and MCP config for your AI agents.</p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <label>Hackathon Name *</label>
            <input value={config.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. HackMIT 2026" />
          </div>

          <div className="space-y-1.5">
            <label>Duration</label>
            <select value={config.duration} onChange={(e) => update('duration', Number(e.target.value))}>
              {DURATIONS.map(d => (<option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label>Track / Theme</label>
            <div className="flex gap-2">
              <input value={config.track} onChange={(e) => update('track', e.target.value)} placeholder="e.g. Education, Climate, Health..." className="flex-1" />
              <button onClick={suggestTrack} disabled={suggestingTrack} className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0">
                {suggestingTrack ? (<div className="w-3.5 h-3.5 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />) : (<SparkleIcon />)}
                Suggest
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label>Tech Stack</label>
            <input value={config.tech} onChange={(e) => update('tech', e.target.value)} placeholder="e.g. React, Python, TensorFlow" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_STACKS.map(stack => (
                <button key={stack} onClick={() => addStack(stack)} className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1 hover:border-[#8A61FF]/50 hover:text-[#8A61FF] transition-all">+ {stack}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label>Team Members</label>
            <textarea value={config.team} onChange={(e) => update('team', e.target.value)} placeholder="One name per line&#10;e.g.&#10;Alice&#10;Bob&#10;Charlie" rows={3} className="flex-1 w-full" />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!config.name.trim() || submitting} className="btn-primary w-full mt-2 py-3 text-base">
          {submitting ? (<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating Plan...</span>) : 'Generate Plan & Start'}
        </button>
      </div>
    </div>
  )
}

function PlanViewer({ plan, config, onEditPlan, onNewProject }) {
  const [showEdit, setShowEdit] = useState(false)
  const [editContent, setEditContent] = useState('')

  const exportConfig = () => {
    const payload = JSON.stringify({ project: config, plan, mcp: { server: 'mcp://localhost:3100', protocol: 'model-context-protocol' } }, null, 2)
    navigator.clipboard.writeText(payload)
    toast.success('Config JSON copied to clipboard')
  }

  const openEdit = () => { setEditContent(plan); setShowEdit(true) }

  const saveEdit = () => { onEditPlan(editContent); setShowEdit(false); toast.success('Plan updated') }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-mono">Project Plan</h2>
          <div className="flex items-center gap-2">
            <button onClick={openEdit} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"><SparkleIcon /> Edit Plan</button>
            <button onClick={exportConfig} className="btn-outline text-xs px-3 py-1.5">Export Config</button>
            <button onClick={onNewProject} className="btn-outline text-xs px-3 py-1.5 text-red-400 border-red-400/30 hover:bg-red-500/10">New Project</button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none plan-render" dangerouslySetInnerHTML={{ __html: parseMarkdown(plan) }} />

        <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-4 text-xs text-gray-500">
          <span><span className="text-gray-400 font-medium">Hackathon:</span> {config.name}</span>
          <span><span className="text-gray-400 font-medium">Duration:</span> {config.duration}h</span>
          <span><span className="text-gray-400 font-medium">Track:</span> {config.track || 'Open'}</span>
          <span><span className="text-gray-400 font-medium">Team:</span> {config.team ? config.team.split('\n').length : '0'} members</span>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowEdit(false)}>
          <div className="glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold font-mono mb-3">Edit Plan</h3>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="flex-1 min-h-[300px] text-sm font-mono mb-4" />
            <div className="flex items-center gap-3">
              <button onClick={() => setShowEdit(false)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
              <button onClick={saveEdit} className="btn-primary flex-1 py-2 text-sm">Save Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TasksTable({ tasks, setTasks, agents }) {
  const [editingTask, setEditingTask] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editingTime, setEditingTime] = useState(null)
  const [editTimeValue, setEditTimeValue] = useState('')

  const updateField = (id, field, value) => setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))

  const startEditName = (task) => { setEditingTask(task.id); setEditValue(task.name) }
  const saveEditName = (id) => { if (editValue.trim()) { updateField(id, 'name', editValue); setEditingTask(null); setEditValue('') } }

  const startEditTime = (task) => { setEditingTime(task.id); setEditTimeValue(task.time) }
  const saveEditTime = (id) => { if (editTimeValue.trim()) { updateField(id, 'time', editTimeValue); setEditingTime(null); setEditTimeValue('') } }

  const addTask = () => {
    taskIdCounter += 1
    setTasks(prev => [...prev, { id: taskIdCounter, name: 'New task', time: '30m', assignee: '', status: 'open', commitHash: '' }])
    toast.success('Task added')
  }

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id))

  const statusIcon = (status) => {
    switch (status) {
      case 'done': return <span className="text-green-400 text-xs font-mono">&#10003;</span>
      case 'in-progress': return <span className="text-amber-400 text-xs animate-spin inline-block">&#9696;</span>
      default: return <span className="text-gray-600 text-xs">&#9679;</span>
    }
  }

  const sorted = [...tasks].sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 0
    const sb = STATUS_ORDER[b.status] ?? 0
    return sa - sb
  })

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold font-mono">Tasks</h3>
        <button onClick={addTask} className="btn-outline text-xs px-3 py-1.5">+ Add Task</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-700/50">
              <th className="text-left font-medium py-2 pr-2 w-6"></th>
              <th className="text-left font-medium py-2 pr-2">Task</th>
              <th className="text-left font-medium py-2 px-2 w-16">Est.</th>
              <th className="text-left font-medium py-2 px-2 w-24">Assignee</th>
              <th className="text-left font-medium py-2 px-2 w-20">Status</th>
              <th className="text-left font-medium py-2 pl-2 w-20">Commit</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(task => {
              const agentName = task.assignee || '(free)'
              return (
                <tr key={task.id} className="border-b border-gray-800/50 group hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 pr-2">{statusIcon(task.status)}</td>
                  <td className="py-2 pr-2">
                    {editingTask === task.id ? (
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEditName(task.id)} onKeyDown={(e) => e.key === 'Enter' && saveEditName(task.id)} className="text-xs py-0.5 px-1 w-full" autoFocus />
                    ) : (
                      <span onClick={() => startEditName(task)} className={`cursor-text ${task.status === 'done' ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.name}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editingTime === task.id ? (
                      <input value={editTimeValue} onChange={(e) => setEditTimeValue(e.target.value)} onBlur={() => saveEditTime(task.id)} onKeyDown={(e) => e.key === 'Enter' && saveEditTime(task.id)} className="text-xs py-0.5 px-1 w-14 font-mono" autoFocus />
                    ) : (
                      <span onClick={() => startEditTime(task)} className="font-mono text-gray-400 cursor-text">{task.time}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-gray-400">{agentName}</td>
                  <td className="py-2 px-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      task.status === 'done' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}>{task.status}</span>
                  </td>
                  <td className="py-2 pl-2">
                    {task.commitHash ? (
                      <span className="font-mono text-[10px] text-[#8A61FF]">{task.commitHash.substring(0, 6)}</span>
                    ) : (
                      <span className="text-gray-600">--</span>
                    )}
                  </td>
                  <td className="py-2">
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No tasks yet. Add a task to get started.</div>
      )}
    </div>
  )
}

function ConnectedAgents({ agents, onRegisterAgent }) {
  const [showRegister, setShowRegister] = useState(false)
  const [regName, setRegName] = useState('')
  const [regType, setRegType] = useState('OpenCode')

  const agentList = Object.entries(agents)

  const handleRegister = () => {
    if (!regName.trim()) { toast.error('Enter an agent name'); return }
    onRegisterAgent(regName.trim(), regType)
    setShowRegister(false)
    setRegName('')
    toast.success(`Registered ${regName}`)
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <span>&#128101;</span> Connected Agents
        </h3>
        <button onClick={() => setShowRegister(true)} className="btn-outline text-[10px] px-2 py-1">+ Register</button>
      </div>

      {agentList.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-xs">No agents connected. Register an agent to begin.</div>
      ) : (
        <div className="space-y-2">
          {agentList.map(([id, agent]) => (
            <div key={id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30 border border-gray-700/50">
              <StatusDot status={agent.status} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{id}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{agent.type}</span>
                  <span className="text-[10px] text-gray-500">{agent.status === 'working' ? `working on Task ${agent.taskId || ''}` : 'idle'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRegister(false)}>
          <div className="glass-card p-5 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold font-mono mb-4">Register Agent</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs">Agent Name</label>
                <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Agent D" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs">Agent Type</label>
                <select value={regType} onChange={(e) => setRegType(e.target.value)} className="text-sm">
                  {AGENT_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setShowRegister(false)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
              <button onClick={handleRegister} className="btn-primary flex-1 py-2 text-sm">Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityLog({ logs, onClear }) {
  const logEndRef = useRef(null)

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  const colorClass = (entry) => {
    if (entry.type === 'error') return 'text-red-400'
    if (entry.type === 'system') return 'text-gray-500'
    return 'text-gray-300'
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <span>&#128200;</span> Activity Log
        </h3>
        <button onClick={onClear} className="text-[10px] text-gray-500 hover:text-white transition-colors">Clear</button>
      </div>

      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 font-mono text-[10px]">
        {logs.length === 0 ? (
          <div className="text-gray-600 py-4 text-center">No activity yet</div>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className={`leading-relaxed ${colorClass(entry)}`}>
              <span className="text-gray-600">[{entry.ts}]</span>{' '}
              <span className="text-gray-500">{entry.agent}</span>{' '}
              <span>{entry.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

function GeneratedAssets({ assets, onGenerateAll, generating }) {
  const assetKeys = [
    { key: 'slides', label: 'Slides', icon: '&#127912;' },
    { key: 'video', label: 'Video', icon: '&#127916;' },
    { key: 'devpost', label: 'Devpost', icon: '&#128221;' },
  ]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <span>&#127917;</span> Generated Assets
        </h3>
        <button onClick={onGenerateAll} disabled={generating} className="btn-outline text-[10px] px-2 py-1 flex items-center gap-1">
          {generating ? <div className="w-3 h-3 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" /> : null}
          Generate All
        </button>
      </div>

      <div className="space-y-2">
        {assetKeys.map(({ key, label, icon }) => {
          const asset = assets[key]
          const status = asset?.status || 'not-started'
          const statusLabel = status === 'ready' ? 'Ready' : status === 'pending' ? 'Pending...' : 'Not Started'
          return (
            <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/20 border border-gray-700/30">
              <div className="flex items-center gap-2">
                <span dangerouslySetInnerHTML={{ __html: icon }} />
                <div>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-gray-500">
                    {status === 'ready' ? `by ${asset.generatedBy || 'Agent'}` : statusLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  status === 'ready' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                  status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-gray-800 text-gray-500 border border-gray-700'
                }`}>{statusLabel}</span>
                {status === 'ready' && <button className="text-[10px] text-[#8A61FF] hover:underline">View</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MCPConnectionBar({ mcpRunning, config }) {
  const MCP_URL = 'https://talented-cat-production-d297.up.railway.app'

  const copyCommand = () => {
    const text = `# Connect your agent to the hosted MCP server:
opencode --mcp ${MCP_URL}/mcp`
    navigator.clipboard.writeText(text)
    toast.success('Command copied to clipboard')
  }

  const copySseEndpoint = () => {
    navigator.clipboard.writeText(`${MCP_URL}/mcp`)
    toast.success('SSE endpoint copied')
  }

  const downloadConfig = () => {
    const payload = JSON.stringify({ project: config, mcp: { server: `${MCP_URL}/mcp`, protocol: 'model-context-protocol' } }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'hackeasy-plan.json'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Config downloaded')
  }

  return (
    <div className="glass-card p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${mcpRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-sm font-mono font-bold">MCP Server</span>
          </div>
          <span className={`text-xs font-mono ${mcpRunning ? 'text-green-400' : 'text-gray-500'}`}>
            {mcpRunning ? '&#9679; Running' : '&#9675; Not Running'}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2 font-mono text-xs bg-gray-900 rounded-lg px-3 py-2 border border-gray-700/50 overflow-x-auto">
          <span className="text-gray-500">{MCP_URL}/mcp</span>
          <button onClick={copySseEndpoint} className="ml-auto text-[#8A61FF] hover:text-white transition-colors flex-shrink-0">&#128203;</button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={copyCommand} className="btn-primary text-xs px-4 py-2 whitespace-nowrap">Copy Connect Command</button>
          <button onClick={downloadConfig} className="btn-outline text-xs px-4 py-2 whitespace-nowrap">Download Config</button>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-gray-500 leading-relaxed bg-gray-900/50 rounded-lg p-3 border border-gray-800/50">
        <span className="text-gray-400 font-medium">Instructions:</span> The MCP server is already running. Connect any MCP-compatible agent:
        <div className="mt-1.5 font-mono text-[10px] bg-gray-950 rounded p-2 border border-gray-800">
          opencode --mcp {MCP_URL}/mcp
        </div>
        <div className="mt-1 font-mono text-[10px] bg-gray-950 rounded p-2 border border-gray-800">
          # Or add to your MCP config:<br />
          {'{"mcpServers":{"hackeasy":{"url":"' + MCP_URL + '/mcp"}}}'}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [plan, setPlan] = useState(null)
  const [config, setConfig] = useState({ name: '', duration: 24, track: '', team: '', tech: '' })
  const [tasks, setTasks] = useState([])
  const [agents, setAgents] = useState({})
  const [logs, setLogs] = useState([])
  const [assets, setAssets] = useState({ slides: { status: 'not-started' }, video: { status: 'not-started' }, devpost: { status: 'not-started' } })
  const [mcpRunning, setMcpRunning] = useState(false)
  const [generatingAssets, setGeneratingAssets] = useState(false)

  const addLog = useCallback((agent, message, type = 'info') => {
    const now = new Date()
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    setLogs(prev => [...prev, { ts, agent, message, type }])
  }, [])

  const handleGeneratePlan = (cfg, planMd) => {
    setConfig(cfg)
    setPlan(planMd)
    setTasks(SAMPLE_TASKS.map(t => ({ ...t })))

    const initialAgents = {}
    AGENT_NAMES.forEach((name, i) => {
      initialAgents[name] = { type: AGENT_TYPES[i], status: i === 0 ? 'working' : 'idle', taskId: i === 0 ? 1 : null }
    })
    setAgents(initialAgents)

    addLog('System', 'Plan generated and MCP orchestration ready', 'system')
    addLog('Agent A (OpenCode)', 'Claimed Task 1: Set up project scaffolding', 'info')
    addLog('System', 'MCP server endpoint: mcp://localhost:3100', 'system')
  }

  const handleEditPlan = (newPlan) => setPlan(newPlan)

  const handleNewProject = () => {
    setPlan(null)
    setConfig({ name: '', duration: 24, track: '', team: '', tech: '' })
    setTasks([])
    setAgents({})
    setLogs([])
    setAssets({ slides: { status: 'not-started' }, video: { status: 'not-started' }, devpost: { status: 'not-started' } })
    setMcpRunning(false)
    toast.success('Started fresh')
  }

  const handleRegisterAgent = (name, type) => {
    setAgents(prev => ({ ...prev, [name]: { type, status: 'idle', taskId: null } }))
    addLog('System', `${name} (${type}) registered`, 'system')
  }

  const handleClearLogs = () => setLogs([])

  const handleGenerateAssets = () => {
    setGeneratingAssets(true)
    addLog('System', 'Asset generation requested...', 'system')
    setTimeout(() => {
      setAssets({
        slides: { status: 'ready', generatedBy: 'Agent A (OpenCode)', url: '#' },
        video: { status: 'pending', generatedBy: '', url: '' },
        devpost: { status: 'ready', generatedBy: 'Agent B (Claude Code)', url: '#' },
      })
      setGeneratingAssets(false)
      addLog('Agent A (OpenCode)', 'Generated slides deck', 'info')
      addLog('Agent B (Claude Code)', 'Drafted Devpost content', 'info')
      toast.success('Assets generated')
    }, 3000)
  }

  useEffect(() => {
    if (!plan) return
    setMcpRunning(true)
    const interval = setInterval(() => {
      const r = Math.random()
      const openTasks = tasks.filter(t => t.status === 'open')
      const inProgTasks = tasks.filter(t => t.status === 'in-progress')
      const agentEntries = Object.entries(agents)

      if (r < 0.35 && openTasks.length > 0 && agentEntries.length > 0) {
        const idleAgents = agentEntries.filter(([, a]) => a.status === 'idle')
        if (idleAgents.length > 0) {
          const [agentName, agentData] = idleAgents[Math.floor(Math.random() * idleAgents.length)]
          const task = openTasks[Math.floor(Math.random() * openTasks.length)]
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'in-progress', assignee: agentName } : t))
          setAgents(prev => ({ ...prev, [agentName]: { ...agentData, status: 'working', taskId: task.id } }))
          addLog(agentName, `Claimed Task: ${task.name}`, 'info')
        }
      } else if (r < 0.65 && inProgTasks.length > 0) {
        const task = inProgTasks[Math.floor(Math.random() * inProgTasks.length)]
        const hash = Math.random().toString(36).substring(2, 8)
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done', commitHash: hash } : t))
        if (task.assignee) {
          setAgents(prev => prev[task.assignee] ? { ...prev, [task.assignee]: { ...prev[task.assignee], status: 'idle', taskId: null } } : prev)
          addLog(task.assignee, `Completed Task "${task.name}" — commit ${hash.substring(0, 6)}`, 'info')
        }
      } else if (r < 0.8) {
        const allAgents = agentEntries.filter(([, a]) => a.status === 'working')
        if (allAgents.length > 0) {
          const [agentName] = allAgents[Math.floor(Math.random() * allAgents.length)]
          addLog(agentName, 'Pushed commit — syncing with MCP', 'info')
        }
      } else if (r < 0.95) {
        const idleCount = agentEntries.filter(([, a]) => a.status === 'idle').length
        if (idleCount > 0) {
          const [agentName] = agentEntries.filter(([, a]) => a.status === 'idle')[Math.floor(Math.random() * idleCount)]
          addLog(agentName, 'Agent heartbeat — connected & ready', 'system')
        }
      } else {
        addLog('System', 'MCP server health check OK', 'system')
      }
    }, 8000 + Math.random() * 7000)
    return () => clearInterval(interval)
  }, [plan, tasks.length])

  return (
    <>
      <Head>
        <title>Dashboard - HackEasy MCP Orchestration Hub</title>
      </Head>
      <div className="grid-bg min-h-screen">
        <NavBar />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h1 className="text-3xl font-bold font-mono mb-2">MCP Orchestration Hub</h1>
            <p className="text-gray-400">HackEasy generates a plan + MCP server. AI agents connect and execute.</p>
          </div>

          {!plan ? (
            <ConfigForm onSubmit={handleGeneratePlan} />
          ) : (
            <div className="space-y-6">
              <PlanViewer plan={plan} config={config} onEditPlan={handleEditPlan} onNewProject={handleNewProject} />

              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <TasksTable tasks={tasks} setTasks={setTasks} agents={agents} />
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <ConnectedAgents agents={agents} onRegisterAgent={handleRegisterAgent} />
                  <ActivityLog logs={logs} onClear={handleClearLogs} />
                  <GeneratedAssets assets={assets} onGenerateAll={handleGenerateAssets} generating={generatingAssets} />
                </div>
              </div>

              <MCPConnectionBar mcpRunning={mcpRunning} config={config} />
            </div>
          )}
        </main>
      </div>
    </>
  )
}
