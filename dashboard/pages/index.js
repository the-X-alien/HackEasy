import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineDownload,
  HiOutlineClipboardCopy,
  HiOutlineExternalLink,
  HiOutlineRefresh,
  HiOutlineCode,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineLightBulb,
  HiOutlineChip,
} from 'react-icons/hi'
import ScoreGauge from '../components/ScoreGauge'
import ProgressTimeline from '../components/ProgressTimeline'

const DURATIONS = [
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 },
  { label: '36 hours', value: 36 },
  { label: '48 hours', value: 48 },
]

const TECH_STACKS = [
  'React', 'Next.js', 'Vue', 'Svelte', 'Tailwind CSS',
  'Node.js', 'Python', 'Flask', 'FastAPI', 'Django',
  'Go', 'Rust', 'TypeScript', 'Firebase', 'Supabase',
  'MongoDB', 'PostgreSQL', 'Prisma', 'TensorFlow', 'PyTorch',
  'LangChain', 'OpenAI', 'Hugging Face', 'Streamlit', 'Vercel',
]

const STEPS = [
  { id: 'rubric', label: 'Analyzing rubric' },
  { id: 'idea', label: 'Generating idea (HOP methodology)' },
  { id: 'code', label: 'Building code' },
  { id: 'deploy', label: 'Deploying to Vercel' },
  { id: 'pitch', label: 'Creating pitch deck' },
  { id: 'video', label: 'Rendering demo video' },
  { id: 'judge', label: 'Running judge simulation' },
  { id: 'finalize', label: 'Finalizing submission' },
]

const STEP_DURATIONS = {
  rubric: 2000,
  idea: 3000,
  code: 5000,
  deploy: 4000,
  pitch: 3000,
  video: 4000,
  judge: 3000,
  finalize: 2000,
}

function makeInitialSteps() {
  return STEPS.map((s) => ({ ...s, status: 'pending' }))
}

export default function Home() {
  const [view, setView] = useState('landing')
  const [formData, setFormData] = useState({
    hackathon_name: '',
    duration: 48,
    track: '',
    team_members: '',
    tech_stack: [],
    existing_idea: '',
  })
  const [techInput, setTechInput] = useState('')
  const [steps, setSteps] = useState(makeInitialSteps())
  const [currentStep, setCurrentStep] = useState('')
  const [score, setScore] = useState(0)
  const [results, setResults] = useState(null)
  const [generating, setGenerating] = useState(false)
  const abortRef = useRef(false)

  const resetGeneration = useCallback(() => {
    abortRef.current = true
    setGenerating(false)
    setSteps(makeInitialSteps())
    setCurrentStep('')
    setScore(0)
    setResults(null)
  }, [])

  function updateForm(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function toggleTech(stack) {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(stack)
        ? prev.tech_stack.filter((t) => t !== stack)
        : [...prev.tech_stack, stack],
    }))
  }

  function addCustomTech() {
    const val = techInput.trim()
    if (!val) return
    if (!formData.tech_stack.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, val],
      }))
    }
    setTechInput('')
  }

  async function startGeneration() {
    if (!formData.hackathon_name.trim()) {
      toast.error('Please enter a hackathon name')
      return
    }

    abortRef.current = false
    setGenerating(true)
    setView('generating')
    setSteps(makeInitialSteps())
    setCurrentStep('')
    setScore(0)
    setResults(null)

    const stepIds = STEPS.map((s) => s.id)
    let completedCount = 0

    for (const stepId of stepIds) {
      if (abortRef.current) break

      setCurrentStep(stepId)
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: 'in-progress' } : s))
      )

      setScore((prev) => {
        const increment = (Math.random() * 1.5 + 0.3)
        return Math.min(prev + increment, 9.5)
      })

      await new Promise((resolve) => {
        const base = STEP_DURATIONS[stepId] || 2500
        const variance = Math.random() * 1000
        setTimeout(resolve, base + variance)
      })

      if (abortRef.current) break

      const failed = stepId === 'code' && Math.random() < 0.05

      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? { ...s, status: failed ? 'failed' : 'completed' }
            : s
        )
      )

      if (!failed) {
        completedCount++
      }

      if (stepId !== 'finalize') {
        setCurrentStep('')
      }
    }

    if (abortRef.current) return

    const finalScore = 6 + Math.random() * 3.5
    setScore(finalScore)
    setResults({
      repoUrl: 'https://github.com/hackeasy-project/' + slugify(formData.hackathon_name),
      demoUrl: 'https://' + slugify(formData.hackathon_name) + '.vercel.app',
      pitchDeckUrl: '#',
      videoUrl: '#',
      judgeScores: {
        'Technical Complexity': (7 + Math.random() * 3).toFixed(1),
        Innovation: (7 + Math.random() * 3).toFixed(1),
        'Presentation Quality': (7 + Math.random() * 3).toFixed(1),
        'Real-World Impact': (6 + Math.random() * 4).toFixed(1),
        'Overall Polish': (7 + Math.random() * 3).toFixed(1),
      },
    })

    setCurrentStep('finalize')
    setSteps((prev) =>
      prev.map((s) => (s.id === 'finalize' ? { ...s, status: 'in-progress' } : s))
    )

    await new Promise((r) => setTimeout(r, 1500))

    setSteps((prev) =>
      prev.map((s) => (s.id === 'finalize' ? { ...s, status: 'completed' } : s))
    )
    setCurrentStep('')
    setGenerating(false)
    setView('results')
    toast.success('Project generated successfully!')
  }

  function copySummary() {
    if (!results) return

    const summary = [
      `# HackEasy Submission Summary`,
      ``,
      `## Project`,
      `**Hackathon:** ${formData.hackathon_name}`,
      `**Track:** ${formData.track || 'General'}`,
      `**Duration:** ${formData.duration}h`,
      `**Tech Stack:** ${formData.tech_stack.join(', ') || 'N/A'}`,
      ``,
      `## Deliverables`,
      `- **GitHub:** ${results.repoUrl}`,
      `- **Demo:** ${results.demoUrl}`,
      ``,
      `## Judge Scores`,
      ...Object.entries(results.judgeScores).map(
        ([k, v]) => `- **${k}:** ${v}/10`
      ),
      ``,
      `## Competitiveness Score`,
      `**${score.toFixed(1)}/10**`,
    ].join('\n')

    navigator.clipboard.writeText(summary).then(
      () => toast.success('Summary copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => { resetGeneration(); setView('landing') }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <HiOutlineSparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">HackEasy</span>
          </button>

          {(view === 'generating' || view === 'results') && (
            <button
              onClick={resetGeneration}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              <HiOutlineRefresh className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </nav>

      <main className="pt-16">
        {view === 'landing' && <HeroSection onStart={() => setView('form')} />}
        {view === 'form' && (
          <FormSection
            formData={formData}
            updateForm={updateForm}
            toggleTech={toggleTech}
            techInput={techInput}
            setTechInput={setTechInput}
            addCustomTech={addCustomTech}
            onBack={() => setView('landing')}
            onGenerate={startGeneration}
          />
        )}
        {view === 'generating' && (
          <GeneratingSection steps={steps} currentStep={currentStep} score={score} />
        )}
        {view === 'results' && (
          <ResultsSection
            results={results}
            score={score}
            formData={formData}
            onCopySummary={copySummary}
            onNewProject={() => { resetGeneration(); setView('form') }}
          />
        )}
      </main>
    </div>
  )
}

function HeroSection({ onStart }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.06)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-medium mb-8 animate-fade-in">
          <HiOutlineSparkles className="w-3.5 h-3.5" />
          AI-Powered Hackathon Engine
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
          <span className="glow-text">HackEasy</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-100">
          Win any hackathon without writing code. From idea generation to pitch deck,
          demo video, and deployment — fully automated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-200">
          <button onClick={onStart} className="btn-primary text-base px-8 py-4">
            <HiOutlineSparkles className="w-5 h-5" />
            New Project
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto animate-fade-in animate-delay-300">
          {[
            { icon: HiOutlineLightBulb, label: 'Idea Generation', desc: 'HOP methodology' },
            { icon: HiOutlineCode, label: 'Code Building', desc: 'Full-stack apps' },
            { icon: HiOutlineDocumentText, label: 'Pitch Deck', desc: 'Auto-generated' },
            { icon: HiOutlineChip, label: 'Judge Simulation', desc: 'Score prediction' },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card p-4 text-center hover:bg-white/[0.07] transition-all duration-300"
            >
              <item.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-200">{item.label}</div>
              <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FormSection({
  formData,
  updateForm,
  toggleTech,
  techInput,
  setTechInput,
  addCustomTech,
  onBack,
  onGenerate,
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
      <button onClick={onBack} className="btn-secondary text-xs px-3 py-1.5 mb-8">
        &larr; Back
      </button>

      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-8">New Project</h2>

        <div className="space-y-6">
          <div>
            <label className="input-label" htmlFor="hackathon_name">
              Hackathon Name <span className="text-red-400">*</span>
            </label>
            <input
              id="hackathon_name"
              className="input-field"
              placeholder="e.g. ETHGlobal San Francisco"
              value={formData.hackathon_name}
              onChange={(e) => updateForm('hackathon_name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="duration">
                Duration
              </label>
              <select
                id="duration"
                className="input-field"
                value={formData.duration}
                onChange={(e) => updateForm('duration', Number(e.target.value))}
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value} className="bg-gray-900">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="track">
                Track <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="track"
                className="input-field"
                placeholder="e.g. DeFi, AI, Social Impact"
                value={formData.track}
                onChange={(e) => updateForm('track', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="team_members">
              Team Members <span className="text-gray-500">(optional, one per line)</span>
            </label>
            <textarea
              id="team_members"
              className="input-field min-h-[100px] resize-y"
              placeholder="Alice&#10;Bob&#10;Charlie"
              value={formData.team_members}
              onChange={(e) => updateForm('team_members', e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">
              Tech Stack Preferences <span className="text-gray-500">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TECH_STACKS.map((stack) => {
                const selected = formData.tech_stack.includes(stack)
                return (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => toggleTech(stack)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                      selected
                        ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                    }`}
                  >
                    {stack}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Add custom tech..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addCustomTech() }
                }}
              />
              <button type="button" onClick={addCustomTech} className="btn-secondary text-xs px-3">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="existing_idea">
              Existing Idea <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="existing_idea"
              className="input-field min-h-[120px] resize-y"
              placeholder="Paste any rough idea you have. We'll refine and expand it using HOP methodology."
              value={formData.existing_idea}
              onChange={(e) => updateForm('existing_idea', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <button onClick={onGenerate} className="btn-primary w-full text-base py-4">
            <HiOutlineSparkles className="w-5 h-5" />
            Generate Winning Project
          </button>
        </div>
      </div>
    </div>
  )
}

function GeneratingSection({ steps, currentStep, score }) {
  const itemRef = useRef(null)

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [currentStep])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in" ref={itemRef}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Generating Your Project</h2>
        <p className="text-gray-400 text-sm">
          Building your hackathon-winning submission...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-4">
          <ProgressTimeline steps={steps} currentStep={currentStep} />
        </div>
        <div className="glass-card p-6 flex items-center justify-center">
          <ScoreGauge score={score} />
        </div>
      </div>
    </div>
  )
}

function ResultsSection({ results, score, formData, onCopySummary, onNewProject }) {
  if (!results) return null

  const totalScore = Object.values(results.judgeScores).reduce(
    (sum, v) => sum + parseFloat(v), 0
  )
  const avgScore = (totalScore / Object.keys(results.judgeScores).length).toFixed(1)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium mb-4">
          <HiOutlineCheckCircle className="w-3.5 h-3.5" />
          Generation Complete
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Your Project is Ready</h2>
        <p className="text-gray-400">
          {formData.hackathon_name} &middot; {formData.track || 'General Track'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Deliverables</h3>
            <div className="space-y-3">
              <a
                href={results.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <HiOutlineCode className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-200">GitHub Repository</div>
                    <div className="text-xs text-gray-500 font-mono">{results.repoUrl}</div>
                  </div>
                </div>
                <HiOutlineExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              <a
                href={results.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <HiOutlineLink className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-200">Live Demo (Vercel)</div>
                    <div className="text-xs text-gray-500 font-mono">{results.demoUrl}</div>
                  </div>
                </div>
                <HiOutlineExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-200">Pitch Deck</div>
                    <div className="text-xs text-gray-500">Presentation slides</div>
                  </div>
                </div>
                <HiOutlineDownload className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <HiOutlineClock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-200">Demo Video</div>
                    <div className="text-xs text-gray-500">Watch or download</div>
                  </div>
                </div>
                <HiOutlineDownload className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Judge Score Summary</h3>
              <span className="glow-text text-2xl font-bold font-mono">{avgScore}</span>
            </div>
            <div className="space-y-3">
              {Object.entries(results.judgeScores).map(([category, score]) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">{category}</span>
                    <span className="text-gray-200 font-mono font-medium">{score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000"
                      style={{ width: `${(parseFloat(score) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6 flex items-center justify-center">
            <ScoreGauge score={score} />
          </div>

          <button onClick={onCopySummary} className="btn-primary w-full">
            <HiOutlineClipboardCopy className="w-4 h-4" />
            Copy Submission Summary
          </button>

          <button onClick={onNewProject} className="btn-secondary w-full">
            <HiOutlineSparkles className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>
    </div>
  )
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
