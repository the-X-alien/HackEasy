import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'

const DURATIONS = [1, 2, 4, 8, 12, 24, 36, 48]
const COMMON_STACKS = ['Next.js', 'Python', 'Flutter', 'React', 'Hardware']
const PITCH_TABS = ['Pitch Deck', 'Devpost Writer', 'Demo Video']

const RUBRIC_ITEMS = [
  { id: 'problem', label: 'Problem Statement', text: 'What it does' },
  { id: 'build', label: 'Technical Implementation', text: 'How we built it' },
  { id: 'challenge', label: 'Challenges & Learning', text: 'Challenges' },
  { id: 'accomplish', label: 'Accomplishments', text: 'Accomplishments' },
  { id: 'tech', label: 'Tech Stack Details', text: 'Tech Stack' },
  { id: 'future', label: 'Future Plans', text: 'Future Plans' },
]

const CHECKLIST_ITEMS = [
  { id: 'deploy', label: 'Project Deployed', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'github', label: 'GitHub Repo Created', icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
  { id: 'pitch', label: 'Pitch Deck Generated', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'devpost', label: 'Devpost Content Approved', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'video', label: 'Demo Video Rendered', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'judge', label: 'Judge Score >= 7/10', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
]

const SAMPLE_IDEAS = [
  { id: 1, title: 'StudyFlow', description: 'Real-time collaborative study planner with AI-powered scheduling that adapts to your productivity patterns.', probability: 92, why: 'Education themes consistently win; AI scheduling is topical and feasible in 24h.' },
  { id: 2, title: 'EcoTrack', description: 'Track your carbon footprint through purchases using receipt scanning and ML classification.', probability: 78, why: 'Climate/sustainability tracks are common; strong narrative potential for pitch.' },
  { id: 3, title: 'HealthCompass', description: 'Accessible health resource navigator for underserved communities with voice-first interface.', probability: 65, why: 'Health equity is trending; strong social impact angle for judging.' },
  { id: 4, title: 'Commune', description: 'Hyper-local community bulletin board with AI-moderation and event coordination.', probability: 71, why: 'Community building themes resonate with judges; achievable MVP in limited time.' },
  { id: 5, title: 'SkillBridge', description: 'Micro-learning platform connecting professionals with short-term mentors via video chat.', probability: 83, why: 'Education + career development is a proven winning combo; clear user need.' },
]

const SAMPLE_TASKS = (ideaName) => [
  { id: 1, name: `Set up ${ideaName} project scaffolding`, time: '45m', assignee: '', completed: false },
  { id: 2, name: 'Configure authentication', time: '1h', assignee: '', completed: false },
  { id: 3, name: 'Build core API routes', time: '2h', assignee: '', completed: false },
  { id: 4, name: 'Create main UI components', time: '2.5h', assignee: '', completed: false },
  { id: 5, name: 'Implement data persistence', time: '1.5h', assignee: '', completed: false },
  { id: 6, name: 'Write tests for critical paths', time: '1h', assignee: '', completed: false },
  { id: 7, name: 'Prepare demo script', time: '30m', assignee: '', completed: false },
  { id: 8, name: 'Final polish and bug fixes', time: '1h', assignee: '', completed: false },
]

const INITIAL_SLIDES = [
  { id: 1, title: 'Title Slide', content: 'Project Name\nA Hackathon Project', type: 'text' },
  { id: 2, title: 'Problem', content: 'The problem we identified during the hackathon.', type: 'text' },
  { id: 3, title: 'Solution', content: 'How our project solves this problem.', type: 'bullet' },
  { id: 4, title: 'Demo', content: 'Screenshot placeholder - insert demo image', type: 'screenshot' },
  { id: 5, title: 'Impact', content: 'Why this matters and who it helps.', type: 'text' },
]

function SparkleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5 text-green-400'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5 text-red-400'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5 text-amber-400'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
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
          <span className="hidden sm:inline text-sm text-gray-500 ml-2">/ Dashboard</span>
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

function StepIndicator({ currentStep, completedSteps, onStepClick }) {
  const steps = [
    { num: 1, label: 'Configure' },
    { num: 2, label: 'Plan' },
    { num: 3, label: 'Build' },
    { num: 4, label: 'Polish' },
    { num: 5, label: 'Launch' },
  ]

  return (
    <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isCompleted = completedSteps.includes(step.num)
        const isActive = currentStep === step.num
        const isClickable = completedSteps.includes(step.num) || step.num === currentStep

        return (
          <div key={step.num} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.num)}
              disabled={!isClickable}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap
                ${isActive ? 'bg-[#8A61FF]/15 text-[#8A61FF] border border-[#8A61FF]/30' : ''}
                ${isCompleted ? 'text-green-400' : ''}
                ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}
              `}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border transition-all
                ${isActive ? 'bg-[#8A61FF] text-white border-[#8A61FF] animate-pulse' : ''}
                ${isCompleted ? 'bg-green-500/20 text-green-400 border-green-500/40' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-800 text-gray-500 border-gray-700' : ''}
              `}>
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mx-1 ${completedSteps.includes(step.num + 1) || (isCompleted && i < steps.length - 1) ? 'bg-green-500/40' : 'bg-gray-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function generateIdeas() {
  const prefixes = ['Neura', 'Quantum', 'Aura', 'Pulse', 'Nova', 'Flux', 'Zenith', 'Vertex', 'Echo', 'Luna']
  const concepts = ['Connect', 'Learn', 'Track', 'Build', 'Share', 'Analyze', 'Guide', 'Transform']
  const domains = ['education', 'health', 'climate', 'productivity', 'community', 'finance', 'wellness']
  const ideas = []
  const used = new Set()

  for (let i = 0; i < 5; i++) {
    let title = ''
    while (!title || used.has(title)) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)]
      const c = concepts[Math.floor(Math.random() * concepts.length)]
      title = p + c
    }
    used.add(title)
    const domain = domains[i % domains.length]
    const prob = Math.floor(Math.random() * 30) + 65
    const whyTexts = {
      education: 'Education themes consistently attract judges; achievable MVP in limited time.',
      health: 'Health equity is a growing focus for sponsors; strong impact narrative.',
      climate: 'Sustainability tracks are increasingly common; bonus points for environmental focus.',
      productivity: 'Productivity tools have clear user validation; easy to demo.',
      community: 'Community-building solutions resonate with social impact criteria.',
      finance: 'Financial inclusion is a recurring theme; data-driven demos score well.',
      wellness: 'Mental health and wellness is a top-3 hackathon category; broad appeal.',
    }
    ideas.push({
      id: i + 1,
      title,
      description: `AI-powered platform to ${c.toLowerCase()} in the ${domain} space, built for ${new Date().getFullYear()} hackathon standards.`,
      probability: prob,
      why: whyTexts[domain],
    })
  }

  return ideas.sort((a, b) => b.probability - a.probability)
}

function NavArrow({ dir, onClick }) {
  return (
    <button onClick={onClick} className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500 hover:text-white">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
    </button>
  )
}

function ProjectConfig({ config, onUpdate, onContinue }) {
  const [suggestingTrack, setSuggestingTrack] = useState(false)
  const [suggestingRoles, setSuggestingRoles] = useState(false)

  const suggestTrack = () => {
    if (!config.name.trim()) {
      toast.error('Enter a hackathon name first')
      return
    }
    setSuggestingTrack(true)
    setTimeout(() => {
      const tracks = ['AI/ML Innovation', 'Social Impact', 'Developer Tools', 'Health Tech', 'EdTech']
      const suggestion = tracks[Math.floor(Math.random() * tracks.length)]
      onUpdate('track', suggestion)
      setSuggestingTrack(false)
      toast.success(`Suggested track: ${suggestion}`)
    }, 1200)
  }

  const suggestRoles = () => {
    if (!config.team.trim()) {
      toast.error('Enter team members first')
      return
    }
    setSuggestingRoles(true)
    setTimeout(() => {
      const names = config.team.split('\n').filter(Boolean)
      const roles = ['Frontend Lead', 'Backend Lead', 'ML Engineer', 'UI/UX Designer', 'Project Manager', 'DevOps', 'Full Stack Developer', 'Data Engineer']
      const assigned = names.map((name, i) => `${name.trim()} - ${roles[i % roles.length]}`).join('\n')
      onUpdate('team', assigned)
      setSuggestingRoles(false)
      toast.success('Roles suggested based on team size')
    }, 1500)
  }

  const addStack = (stack) => {
    const current = config.tech ? config.tech.split(',').map(s => s.trim()).filter(Boolean) : []
    if (current.includes(stack)) {
      toast.error(`${stack} already added`)
      return
    }
    current.push(stack)
    onUpdate('tech', current.join(', '))
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold font-mono mb-1">Project Configuration</h2>
        <p className="text-sm text-gray-400 mb-6">Set up your hackathon profile so your co-pilot knows the context.</p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <label>Hackathon Name *</label>
            <input
              value={config.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="e.g. HackMIT 2026"
            />
          </div>

          <div className="space-y-1.5">
            <label>Duration</label>
            <select value={config.duration} onChange={(e) => onUpdate('duration', Number(e.target.value))}>
              {DURATIONS.map(d => (
                <option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label>Track / Theme</label>
            <div className="flex gap-2">
              <input
                value={config.track}
                onChange={(e) => onUpdate('track', e.target.value)}
                placeholder="e.g. Education, Climate, Health..."
                className="flex-1"
              />
              <button
                onClick={suggestTrack}
                disabled={suggestingTrack}
                className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0"
                title="Suggest track"
              >
                {suggestingTrack ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SparkleIcon />
                )}
                Suggest
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label>Tech Stack</label>
            <input
              value={config.tech}
              onChange={(e) => onUpdate('tech', e.target.value)}
              placeholder="e.g. React, Python, TensorFlow"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_STACKS.map(stack => (
                <button
                  key={stack}
                  onClick={() => addStack(stack)}
                  className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1 hover:border-[#8A61FF]/50 hover:text-[#8A61FF] transition-all"
                >
                  + {stack}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label>Team Members</label>
            <div className="flex gap-2">
              <textarea
                value={config.team}
                onChange={(e) => onUpdate('team', e.target.value)}
                placeholder="One name per line&#10;e.g.&#10;Alice&#10;Bob&#10;Charlie"
                rows={3}
                className="flex-1"
              />
              <button
                onClick={suggestRoles}
                disabled={suggestingRoles}
                className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0 self-start"
                title="Suggest roles"
              >
                {suggestingRoles ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SparkleIcon />
                )}
                Suggest
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          disabled={!config.name.trim()}
          className="btn-primary w-full mt-2 py-3 text-base"
        >
          Continue to Planning
        </button>
      </div>
    </div>
  )
}

function IdeaTaskPlanner({ config, onApprove }) {
  const [ideas, setIdeas] = useState([])
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [generating, setGenerating] = useState(true)
  const [tasks, setTasks] = useState([])
  const [taskGenerating, setTaskGenerating] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    setGenerating(true)
    const timer = setTimeout(() => {
      setIdeas(generateIdeas())
      setGenerating(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!selectedIdea) return
    setTaskGenerating(true)
    const timer = setTimeout(() => {
      setTasks(SAMPLE_TASKS(selectedIdea.title))
      setTaskGenerating(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [selectedIdea])

  const regenerateIdeas = () => {
    setGenerating(true)
    setSelectedIdea(null)
    setTasks([])
    setTimeout(() => {
      setIdeas(generateIdeas())
      setGenerating(false)
    }, 1500)
  }

  const regenerateTasks = () => {
    setTaskGenerating(true)
    setTimeout(() => {
      setTasks(SAMPLE_TASKS(selectedIdea?.title || 'Project'))
      setTaskGenerating(false)
      toast.success('Tasks regenerated')
    }, 1200)
  }

  const moveTask = (idx, dir) => {
    const newTasks = [...tasks]
    const target = idx + dir
    if (target < 0 || target >= newTasks.length) return
    const temp = newTasks[target]
    newTasks[target] = newTasks[idx]
    newTasks[idx] = temp
    setTasks(newTasks)
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const startEditTask = (task) => {
    setEditingTask(task.id)
    setEditValue(task.name)
  }

  const saveEditTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, name: editValue } : t))
    setEditingTask(null)
    setEditValue('')
  }

  const addTask = () => {
    const maxId = Math.max(...tasks.map(t => t.id), 0)
    setTasks([...tasks, { id: maxId + 1, name: 'New task', time: '30m', assignee: '', completed: false }])
  }

  const updateTaskField = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const totalTimeHours = tasks.reduce((acc, t) => {
    const val = t.time
    if (val.includes('h')) {
      const parts = val.split('h')
      return acc + (parts[0] ? parseFloat(parts[0]) : 0) + (parts[1]?.includes('m') ? parseInt(parts[1]) / 60 : 0)
    }
    if (val.includes('m')) return acc + parseInt(val) / 60
    return acc
  }, 0)

  const isOverScoped = totalTimeHours > config.duration

  const probabilityColor = (p) => {
    if (p >= 80) return 'text-green-400 bg-green-500/10 border-green-500/30'
    if (p >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    return 'text-red-400 bg-red-500/10 border-red-500/30'
  }

  return (
    <div className="grid md:grid-cols-2 gap-6" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Idea Lab</h3>
            <p className="text-xs text-gray-500 mt-0.5">AI suggests ideas based on your config</p>
          </div>
          <button onClick={regenerateIdeas} disabled={generating} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5">
            {generating ? (
              <div className="w-3 h-3 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
            ) : (
              <SparkleIcon />
            )}
            Generate New Ideas
          </button>
        </div>

        {generating ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">AI is researching past winners...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {ideas.map(idea => (
              <div
                key={idea.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedIdea?.id === idea.id
                    ? 'border-[#8A61FF] bg-[#8A61FF]/5'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
                onClick={() => setSelectedIdea(idea)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold">{idea.title}</h4>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${probabilityColor(idea.probability)}`}>
                    {idea.probability}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{idea.description}</p>
                <p className="text-[10px] text-gray-500 italic">{idea.why}</p>
                {selectedIdea?.id === idea.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400"><span className="text-gray-500 font-medium">Problem:</span> Hackers struggle to find time to plan during hackathons.</p>
                    <p className="text-xs text-gray-400 mt-1"><span className="text-gray-500 font-medium">Solution:</span> AI-powered assistant that does the planning for them.</p>
                    <p className="text-xs text-gray-400 mt-1"><span className="text-gray-500 font-medium">Target:</span> First-time and intermediate hackathon participants.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        {!selectedIdea ? (
          <div className="flex items-center justify-center py-16 text-center">
            <div>
              <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-gray-500">Select an idea to see suggested tasks</p>
            </div>
          </div>
        ) : taskGenerating ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">AI is breaking down tasks...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold">Task Board</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Total: {totalTimeHours.toFixed(1)}h / {config.duration}h
                  {isOverScoped && (
                    <span className="text-red-400 ml-2 font-medium">Over-scoped!</span>
                  )}
                </p>
              </div>
              <button onClick={regenerateTasks} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5">
                <SparkleIcon />
                Regenerate
              </button>
            </div>

            {isOverScoped && (
              <div className="flex items-center gap-2 p-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <WarningIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-[10px] text-red-300">Estimated time exceeds hackathon duration. Consider trimming tasks.</p>
              </div>
            )}

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-800/40 border border-gray-700/50 group">
                  <button
                    onClick={() => updateTaskField(task.id, 'completed', !task.completed)}
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-[#8A61FF]'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingTask === task.id ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEditTask(task.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditTask(task.id)}
                        className="text-xs py-1 px-2"
                        autoFocus
                      />
                    ) : (
                      <p className={`text-xs ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                        {task.name}
                      </p>
                    )}
                  </div>

                  <input
                    value={task.time}
                    onChange={(e) => updateTaskField(task.id, 'time', e.target.value)}
                    className="text-[10px] py-0.5 px-1.5 w-14 text-center font-mono"
                  />

                  <input
                    value={task.assignee}
                    onChange={(e) => updateTaskField(task.id, 'assignee', e.target.value)}
                    placeholder="who?"
                    className="text-[10px] py-0.5 px-1.5 w-16"
                  />

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => startEditTask(task)} className="p-0.5 text-gray-500 hover:text-[#8A61FF] transition-colors" title="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <NavArrow dir="up" onClick={() => moveTask(idx, -1)} />
                    <NavArrow dir="down" onClick={() => moveTask(idx, 1)} />
                    <button onClick={() => deleteTask(task.id)} className="p-0.5 text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addTask} className="btn-outline text-xs w-full mt-3 py-2">
              + Add Task
            </button>

            <button
              onClick={() => onApprove(selectedIdea, tasks)}
              className="btn-primary w-full mt-3 py-2.5 text-sm"
            >
              Approve Plan & Continue to Build
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function CodeCopilot({ onComplete }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [diffs, setDiffs] = useState([])
  const [approvedLog, setApprovedLog] = useState([])
  const [processing, setProcessing] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ role: 'ai', text: "I've analyzed your plan. I can start building the project structure. What would you like me to work on first?" }])
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const simulateDiff = (label) => {
    const diffId = Date.now()
    const newDiff = {
      id: diffId,
      label,
      content: `+ // ${label}\n+ // Generated by HackEasy Co-Pilot\n+ \n+ function handle${label.replace(/\s/g, '')}() {\n+   // Implementation here\n+   return { status: 'ok' }\n+ }\n+ \n+ export default handle${label.replace(/\s/g, '')}`,
      status: 'pending',
    }
    setDiffs(prev => [...prev, newDiff])
    return diffId
  }

  const sendMessage = (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setProcessing(true)

    setTimeout(() => {
      const responses = [
        "I've generated the component structure. Check the diff on the right and let me know if you want any changes.",
        "Done! I've created the API routes following the patterns in your plan. Review and approve when ready.",
        "Here's the implementation. I kept it modular so you can extend it easily. Take a look at the diff.",
        "I've set up the database schema and models. The migrations are ready for review.",
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, { role: 'ai', text: response }])
      simulateDiff(text.substring(0, 30))
      setProcessing(false)
    }, 2000)
  }

  const handleAction = (action) => {
    setMessages(prev => [...prev, { role: 'user', text: action }])
    setProcessing(true)

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: `Generating ${action.toLowerCase()}... Check the review panel for the diff.` }])
      simulateDiff(action)
      setProcessing(false)
    }, 2500)
  }

  const approveDiff = (id) => {
    setDiffs(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d))
    const diff = diffs.find(d => d.id === id)
    if (diff) {
      setApprovedLog(prev => [...prev, diff.label])
    }
    toast.success('Change approved and merged')
  }

  const rejectDiff = (id) => {
    setDiffs(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d))
    toast.error('Change rejected')
  }

  const pendingCount = diffs.filter(d => d.status === 'pending').length
  const approvedCount = diffs.filter(d => d.status === 'approved').length

  const actionButtons = ['Generate Project Scaffold', 'Add Auth', 'Create API Route', 'Build UI Component', 'Run Tests', 'Security Scan']

  return (
    <div className="grid md:grid-cols-2 gap-6" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="glass-card p-5 flex flex-col" style={{ minHeight: '500px' }}>
        <div className="mb-3">
          <h3 className="text-base font-semibold">Ask your co-pilot to build features</h3>
          <p className="text-xs text-gray-500 mt-0.5">Describe what you need. Review every change before it lands.</p>
        </div>

        <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1" style={{ maxHeight: '360px' }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#8A61FF]/15 border border-[#8A61FF]/20 text-gray-200'
                    : 'bg-gray-800/60 border border-gray-700/50 text-gray-300'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {actionButtons.map(action => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              disabled={processing}
              className="text-[10px] bg-gray-800 border border-gray-700 rounded-md px-2 py-1 hover:border-[#8A61FF]/50 hover:text-[#8A61FF] transition-all disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
            placeholder="Describe what to build..."
            className="flex-1 text-sm"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || processing}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
          >
            {processing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            Send
          </button>
        </div>
      </div>

      <div className="glass-card p-5 flex flex-col" style={{ minHeight: '500px' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold">Code Review</h3>
            <p className="text-xs text-gray-500 mt-0.5">{approvedCount} approved, {pendingCount} pending review</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: '360px' }}>
          {diffs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <p className="text-xs text-gray-500">Ask your co-pilot to generate code. Changes appear here for review.</p>
              </div>
            </div>
          ) : (
            diffs.map(diff => (
              <div key={diff.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700">
                  <span className="text-xs font-medium text-gray-300">{diff.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    diff.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                    diff.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {diff.status === 'approved' ? 'Merged' : diff.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
                <pre className="text-[10px] font-mono text-gray-300 p-3 overflow-x-auto leading-relaxed">{diff.content}</pre>
                {diff.status === 'pending' && (
                  <div className="flex gap-2 px-3 py-2 border-t border-gray-700">
                    <button onClick={() => approveDiff(diff.id)} className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 rounded-md px-3 py-1 hover:bg-green-500/20 transition-all flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button onClick={() => rejectDiff(diff.id)} className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-md px-3 py-1 hover:bg-red-500/20 transition-all flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}
                {diff.status === 'approved' && (
                  <div className="px-3 py-2 border-t border-gray-700 bg-green-500/5">
                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Merged successfully
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {approvedLog.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-[10px] text-gray-500 mb-2">Approved changes log:</p>
            <div className="space-y-1">
              {approvedLog.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <CheckIcon className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {diffs.filter(d => d.status === 'pending').length === 0 && diffs.length > 0 && (
          <button onClick={onComplete} className="btn-primary w-full mt-3 py-2.5 text-sm">
            Continue to Polish
          </button>
        )}
      </div>
    </div>
  )
}

function PolishStudio({ onComplete }) {
  const [activeTab, setActiveTab] = useState(0)
  const [slides, setSlides] = useState(INITIAL_SLIDES)
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0)
  const [devpostSections, setDevpostSections] = useState({
    problem: 'Our project solves the challenge of planning under tight time constraints during hackathons.',
    build: 'We built it using modern web technologies with AI-powered features.',
    challenges: 'Integrating the AI co-pilot features and managing state across steps.',
    accomplishments: 'A fully functional co-pilot that guides users from idea to submission.',
    tech: 'Next.js, React, Tailwind CSS, AI APIs',
    future: 'Add real-time collaboration and expanded AI features.',
  })
  const [script, setScript] = useState('Welcome to our demo! Today we will show you how our project solves a critical problem.\n\n[Introduce the problem]\n\n[Show the solution]\n\n[Live demo]\n\n[Key results and impact]\n\nThank you! Happy to answer questions.')
  const [videoStyle, setVideoStyle] = useState('auto-zoom')
  const [generating, setGenerating] = useState(false)
  const [regeneratingSection, setRegeneratingSection] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const regenerateSlide = (idx) => {
    const newSlides = [...slides]
    const phrases = ['Reimagine how users interact with this feature', 'Focus on the core value proposition', 'Highlight the transformative impact', 'Emphasize simplicity and scale']
    newSlides[idx] = { ...newSlides[idx], content: phrases[Math.floor(Math.random() * phrases.length)] }
    setSlides(newSlides)
    toast.success('Slide content regenerated')
  }

  const addSlide = () => {
    const maxId = Math.max(...slides.map(s => s.id), 0)
    setSlides([...slides, { id: maxId + 1, title: 'New Slide', content: 'Edit this slide content.', type: 'text' }])
    setSelectedSlideIdx(slides.length)
  }

  const deleteSlide = (idx) => {
    if (slides.length <= 1) {
      toast.error('Need at least one slide')
      return
    }
    setSlides(slides.filter((_, i) => i !== idx))
    if (selectedSlideIdx >= idx) setSelectedSlideIdx(Math.max(0, selectedSlideIdx - 1))
  }

  const updateSlide = (idx, field, value) => {
    const newSlides = [...slides]
    newSlides[idx] = { ...newSlides[idx], [field]: value }
    setSlides(newSlides)
  }

  const regenerateDevpost = (section) => {
    setRegeneratingSection(section)
    setTimeout(() => {
      const alternatives = {
        problem: 'Hackathons are intense. Planning eats time you could spend building. Our co-pilot handles the overhead so you focus on what matters.',
        build: 'We assembled a modern stack — Next.js on the frontend, AI-powered recommendations, and real-time state management across the entire co-pilot workflow.',
        challenges: 'The hardest part was designing a co-pilot that guides without taking over. Every feature went through rounds of human-in-the-loop refinement.',
        accomplishments: 'We built a complete 5-step co-pilot workspace that helps hackers go from idea to submission with full control at every stage.',
        tech: 'React 18, Next.js 14, Tailwind CSS, react-hot-toast, AI/ML APIs',
        future: 'Real-time team collaboration, expanded AI model support, template library from past winners.',
      }
      setDevpostSections(prev => ({ ...prev, [section]: alternatives[section] || prev[section] }))
      setRegeneratingSection(null)
      toast.success('Section regenerated')
    }, 1000)
  }

  const downloadDeck = () => {
    toast.success('Pitch deck downloaded as PDF!')
  }

  const generateVideo = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      toast.success('Demo video preview generated!')
    }, 3000)
  }

  const slideTypes = [
    { value: 'text', label: 'Text' },
    { value: 'bullet', label: 'Bullet Points' },
    { value: 'screenshot', label: 'Screenshot' },
    { value: 'chart', label: 'Chart' },
  ]

  const videoStyles = [
    { value: 'auto-zoom', label: 'Auto-Zoom & Blur', desc: 'Cinematic' },
    { value: 'screen', label: 'Screen Capture', desc: 'Simple' },
    { value: 'slideshow', label: 'Slideshow', desc: 'Static screenshots' },
  ]

  const selected = slides[selectedSlideIdx]

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="flex border-b border-gray-700 mb-6">
        {PITCH_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === i
                ? 'border-[#8A61FF] text-[#8A61FF]'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div>
          <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setSelectedSlideIdx(idx)}
                className={`flex-shrink-0 w-28 p-2 rounded-lg border text-left transition-all ${
                  selectedSlideIdx === idx
                    ? 'border-[#8A61FF] bg-[#8A61FF]/5'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div className="w-full h-16 rounded bg-gray-800 mb-1.5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <p className="text-[10px] font-medium truncate text-gray-400">{slide.title}</p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <input
                  value={selected.title}
                  onChange={(e) => updateSlide(selectedSlideIdx, 'title', e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none p-0 focus:ring-0"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={selected.type}
                    onChange={(e) => updateSlide(selectedSlideIdx, 'type', e.target.value)}
                    className="text-xs py-1 px-2 w-auto"
                  >
                    {slideTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button onClick={() => regenerateSlide(selectedSlideIdx)} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <SparkleIcon />
                    Regenerate
                  </button>
                </div>
              </div>
              <textarea
                value={selected.content}
                onChange={(e) => updateSlide(selectedSlideIdx, 'content', e.target.value)}
                className="w-full min-h-[200px] text-sm"
                placeholder="Slide content..."
              />
              <div className="flex items-center gap-2 mt-4">
                <button onClick={addSlide} className="btn-outline text-xs px-3 py-1.5">+ Add Slide</button>
                <button onClick={() => deleteSlide(selectedSlideIdx)} className="btn-outline text-xs px-3 py-1.5 text-red-400 border-red-400/30 hover:bg-red-500/10">Delete Slide</button>
                <div className="flex-1" />
                <button onClick={downloadDeck} className="btn-primary text-xs px-4 py-1.5">Download Deck</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Draft Editor</h3>
            <div className="space-y-4">
              {Object.entries(devpostSections).map(([key, value]) => {
                const rubric = RUBRIC_ITEMS.find(r => r.id === key)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs mb-0">{rubric?.label || key}</label>
                      <button
                        onClick={() => regenerateDevpost(key)}
                        disabled={regeneratingSection === key}
                        className="text-[10px] text-gray-500 hover:text-[#8A61FF] transition-colors flex items-center gap-1"
                      >
                        {regeneratingSection === key ? (
                          <div className="w-3 h-3 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <SparkleIcon />
                        )}
                        Regenerate
                      </button>
                    </div>
                    <textarea
                      value={value}
                      onChange={(e) => setDevpostSections(prev => ({ ...prev, [key]: e.target.value }))}
                      className="text-xs min-h-[60px] resize-y"
                      rows={3}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => setShowPreview(true)} className="btn-outline text-xs px-4 py-2">Preview Devpost</button>
              <button onClick={() => { toast.success('Devpost content saved!'); onComplete() }} className="btn-primary text-xs px-4 py-2">Approve & Save</button>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Rubric Comparison</h3>
            <div className="space-y-3">
              {RUBRIC_ITEMS.map(item => {
                const hasContent = devpostSections[item.id]?.length > 20
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                    {hasContent ? (
                      <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Rubric: {item.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {showPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
              <div className="glass-card p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-mono mb-4">Devpost Preview</h3>
                <div className="space-y-4">
                  {Object.entries(devpostSections).map(([key, value]) => {
                    const rubric = RUBRIC_ITEMS.find(r => r.id === key)
                    return (
                      <div key={key}>
                        <h4 className="text-sm font-semibold text-[#8A61FF]">{rubric?.label || key}</h4>
                        <p className="text-xs text-gray-400 mt-1">{value}</p>
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setShowPreview(false)} className="btn-primary w-full mt-6 py-2 text-sm">Close Preview</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Demo Video</h3>

          <div className="flex gap-3 mb-6">
            {videoStyles.map(vs => (
              <button
                key={vs.value}
                onClick={() => setVideoStyle(vs.value)}
                className={`flex-1 p-4 rounded-lg border text-left transition-all ${
                  videoStyle === vs.value
                    ? 'border-[#8A61FF] bg-[#8A61FF]/5'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <p className="text-sm font-semibold">{vs.label}</p>
                <p className="text-[10px] text-gray-500 mt-1">{vs.desc}</p>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs mb-0">Script</label>
              <button className="text-[10px] text-gray-500 hover:text-[#8A61FF] transition-colors flex items-center gap-1">
                <SparkleIcon />
                Regenerate
              </button>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full min-h-[150px] text-sm font-mono"
              rows={6}
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={generateVideo} disabled={generating} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Preview
                </>
              )}
            </button>
            <button className="btn-outline text-sm px-4 py-2.5">Download Video</button>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="flex justify-end mt-6">
          <button onClick={onComplete} className="btn-primary text-sm px-6 py-2.5">
            Continue to Launch
          </button>
        </div>
      )}
    </div>
  )
}

function PreFlightLaunch({ onComplete }) {
  const [checklist, setChecklist] = useState(
    CHECKLIST_ITEMS.map(item => ({ ...item, status: Math.random() > 0.5 ? 'complete' : Math.random() > 0.5 ? 'warning' : 'incomplete' }))
  )
  const [showConfirm, setShowConfirm] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [finalSummary, setFinalSummary] = useState(null)

  const statusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckIcon className="w-5 h-5 text-green-400" />
      case 'warning': return <WarningIcon className="w-5 h-5 text-amber-400" />
      default: return <XIcon className="w-5 h-5 text-red-400" />
    }
  }

  const statusLabel = (status) => {
    switch (status) {
      case 'complete': return 'Ready'
      case 'warning': return 'Needs Attention'
      default: return 'Not Started'
    }
  }

  const incomplete = checklist.filter(i => i.status !== 'complete')

  const handleFinalize = () => {
    if (incomplete.length > 0) {
      toast.error(`${incomplete.length} items need attention before submission`)
      return
    }
    setShowConfirm(true)
  }

  const confirmFinalize = () => {
    setShowConfirm(false)
    setFinalized(true)
    const projectName = 'HackEasy Project'
    const summary = {
      title: projectName,
      deployUrl: 'https://project.vercel.app',
      githubUrl: 'https://github.com/hackeasy/project',
      pitchUrl: 'https://docs.google.com/presentation/d/example',
      devpostUrl: 'https://devpost.com/software/example',
      videoUrl: 'https://youtube.com/watch?v=example',
      score: 8.4,
    }
    setFinalSummary(summary)
    toast.success('Project finalized! Ready to submit.')
  }

  const copySummary = () => {
    if (!finalSummary) return
    const text = `# ${finalSummary.title}

## Submission Summary
- **Live Demo**: ${finalSummary.deployUrl}
- **GitHub Repo**: ${finalSummary.githubUrl}
- **Pitch Deck**: ${finalSummary.pitchUrl}
- **Devpost**: ${finalSummary.devpostUrl}
- **Demo Video**: ${finalSummary.videoUrl}
- **Judge Score**: ${finalSummary.score}/10

Built with HackEasy - Your AI Co-Pilot for Hackathons`
    navigator.clipboard.writeText(text)
    toast.success('Summary copied to clipboard!')
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      {!finalized ? (
        <>
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold font-mono mb-1">Pre-Flight Launch</h2>
            <p className="text-sm text-gray-400 mb-6">Final checklist before submission. Your co-pilot has everything ready — you just need to sign off.</p>

            <div className="space-y-3">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    {statusIcon(item.status)}
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className={`text-[10px] mt-0.5 ${
                        item.status === 'complete' ? 'text-green-400' :
                        item.status === 'warning' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>{statusLabel(item.status)}</p>
                    </div>
                  </div>
                  <button className="text-[10px] text-gray-500 hover:text-[#8A61FF] transition-colors">View</button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleFinalize}
              className="btn-primary text-base px-10 py-3 text-lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Finalize & Submit
              </span>
            </button>
            {incomplete.length > 0 && (
              <p className="text-xs text-red-400 mt-3">
                {incomplete.length} item{incomplete.length > 1 ? 's' : ''} need{incomplete.length === 1 ? 's' : ''} attention before submission
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-mono mb-2">Your project is ready!</h2>
          <p className="text-sm text-gray-400 mb-6">Here is what was created:</p>

          {finalSummary && (
            <div className="max-w-md mx-auto text-left space-y-3 mb-6">
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Live Demo</span>
                <a href={finalSummary.deployUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8A61FF] hover:underline">{finalSummary.deployUrl}</a>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-400">GitHub Repo</span>
                <a href={finalSummary.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8A61FF] hover:underline">{finalSummary.githubUrl}</a>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Pitch Deck</span>
                <a href={finalSummary.pitchUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8A61FF] hover:underline">{finalSummary.pitchUrl}</a>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Devpost</span>
                <a href={finalSummary.devpostUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8A61FF] hover:underline">{finalSummary.devpostUrl}</a>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Demo Video</span>
                <a href={finalSummary.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8A61FF] hover:underline">{finalSummary.videoUrl}</a>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Judge Score</span>
                <span className="text-sm font-bold font-mono text-[#8A61FF]">{finalSummary.score}/10</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button onClick={copySummary} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Summary
            </button>
            <button onClick={onComplete} className="btn-outline text-sm px-6 py-2.5">
              Start Over
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-mono mb-2">Ready to finalize?</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure everything is ready? Make sure all checklist items are complete before submitting.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
              <button onClick={confirmFinalize} className="btn-primary flex-1 py-2 text-sm">Yes, Finalize!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [config, setConfig] = useState({
    name: '',
    duration: 24,
    track: '',
    team: '',
    tech: '',
  })
  const [approvedIdea, setApprovedIdea] = useState(null)

  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  const completeStep = (step) => {
    setCompletedSteps(prev => [...new Set([...prev, step])])
    setCurrentStep(step + 1)
  }

  const handleStepClick = (step) => {
    if (completedSteps.includes(step)) setCurrentStep(step)
  }

  const handleConfigContinue = () => {
    if (!config.name.trim()) {
      toast.error('Please enter a hackathon name')
      return
    }
    completeStep(1)
  }

  const handlePlanApprove = (idea, tasks) => {
    setApprovedIdea(idea)
    completeStep(2)
  }

  const handleBuildComplete = () => {
    completeStep(3)
  }

  const handlePolishComplete = () => {
    completeStep(4)
  }

  const handleLaunchComplete = () => {
    setCurrentStep(1)
    setCompletedSteps([])
    setApprovedIdea(null)
    setConfig({ name: '', duration: 24, track: '', team: '', tech: '' })
    toast.success('Started fresh! Build something great.')
  }

  return (
    <>
      <Head>
        <title>Dashboard - HackEasy Co-Pilot</title>
      </Head>
      <div className="grid-bg min-h-screen">
        <NavBar />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h1 className="text-3xl font-bold font-mono mb-2">Your Co-Pilot Workspace</h1>
            <p className="text-gray-400">AI suggests and drafts. You direct, decide, and deliver.</p>
          </div>

          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />

          <div className="mb-6">
            {currentStep === 1 && (
              <ProjectConfig
                config={config}
                onUpdate={updateConfig}
                onContinue={handleConfigContinue}
              />
            )}

            {currentStep === 2 && (
              <IdeaTaskPlanner
                config={config}
                onApprove={handlePlanApprove}
              />
            )}

            {currentStep === 3 && (
              <CodeCopilot onComplete={handleBuildComplete} />
            )}

            {currentStep === 4 && (
              <PolishStudio onComplete={handlePolishComplete} />
            )}

            {currentStep === 5 && (
              <PreFlightLaunch onComplete={handleLaunchComplete} />
            )}
          </div>

          {currentStep <= 5 && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Step
                </button>
              )}
              {currentStep > 1 && <span className="text-gray-700">|</span>}
              <span>Step {currentStep} of 5</span>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
