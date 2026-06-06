import { useState } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'
import ProgressTimeline from '../components/ProgressTimeline'
import IdeaModal from '../components/IdeaModal'
import JudgeSimulator from '../components/JudgeSimulator'

const QUICK_TOOLS = [
  { id: 'idea', label: 'Idea Generator', desc: 'Generate winning ideas from themes', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'pitch', label: 'Pitch Builder', desc: 'Generate elevator pitch and demo script', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { id: 'devpost', label: 'Devpost Writer', desc: 'Auto-generate your full Devpost submission', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'timeline', label: 'Timeline Planner', desc: 'Auto-schedule your coding and testing', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'judge', label: 'Judge Simulator', desc: 'Score your project against the rubric', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'slides', label: 'Slides Creator', desc: 'Generate clean, professional slides', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
]

const DURATIONS = [1, 2, 4, 8, 12, 24, 36, 48]

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[rgb(15,23,42)]/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#8A61FF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-lg font-bold font-mono">HackEasy</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </a>
        </div>
      </div>
    </nav>
  )
}

function FormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label>{label}</label>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [form, setForm] = useState({
    name: '',
    duration: 24,
    track: '',
    team: '',
    tech: '',
    idea: '',
  })
  const [loading, setLoading] = useState(false)
  const [statuses, setStatuses] = useState(null)
  const [result, setResult] = useState(null)
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [showJudgeModal, setShowJudgeModal] = useState(false)

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submitForm = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter a hackathon name')
      return
    }

    setLoading(true)
    setResult(null)
    setStatuses({
      analyze: 'running',
      idea: 'pending',
      code: 'pending',
      deploy: 'pending',
      pitch: 'pending',
      video: 'pending',
      judge: 'pending',
      finalize: 'pending',
    })

    const progressSteps = ['analyze', 'idea', 'code', 'deploy', 'pitch', 'video', 'judge', 'finalize']

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      progressSteps.forEach((step, idx) => {
        setTimeout(() => {
          setStatuses(prev => ({
            ...prev,
            [step]: 'completed',
            ...(progressSteps[idx + 1] ? { [progressSteps[idx + 1]]: 'running' } : { finalize: 'completed' }),
          }))
        }, (idx + 1) * 800)
      })

      setTimeout(() => {
        setResult(data)
        setLoading(false)
        toast.success('Project generated successfully!')
      }, progressSteps.length * 800 + 500)
    } catch {
      toast.error('Something went wrong. Showing mock results.')
      progressSteps.forEach((step, idx) => {
        setTimeout(() => {
          setStatuses(prev => ({
            ...prev,
            [step]: 'completed',
            ...(progressSteps[idx + 1] ? { [progressSteps[idx + 1]]: 'running' } : { finalize: 'completed' }),
          }))
        }, (idx + 1) * 600)
      })
      setTimeout(() => {
        const shortName = form.name.substring(0, 20).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        setResult({
          title: `${form.name} Project`,
          description: `A ${form.track || 'full-stack'} application built for ${form.name}.`,
          techStack: (form.tech || 'React,Node.js,TailwindCSS').split(',').map(t => t.trim()),
          githubRepo: `https://github.com/hackeasy/${shortName}`,
          vercelUrl: `https://${shortName}.vercel.app`,
          pitchDeckUrl: `https://docs.google.com/presentation/d/example`,
          videoUrl: `https://youtube.com/watch?v=example`,
          judgeScores: { innovation: 8, technical: 7, impact: 8, presentation: 7, feasibility: 8 },
          submissionSummary: `${form.name} is a ${form.track || 'full-stack'} application built with ${form.tech || 'modern web technologies'}.`,
        })
        setLoading(false)
        toast.success('Mock results ready!')
      }, 5000)
    }
  }

  const useIdea = (idea) => {
    updateForm('idea', `${idea.title}: ${idea.description}`)
    setShowIdeaModal(false)
    toast.success('Idea added to your project!')
  }

  const handleQuickTool = (id) => {
    switch (id) {
      case 'idea':
        setShowIdeaModal(true)
        break
      case 'judge':
        setShowJudgeModal(true)
        break
      case 'pitch':
        toast.success('Pitch builder is generating your script...')
        break
      case 'devpost':
        toast.success('Devpost content generator ready!')
        break
      case 'timeline':
        toast.success('Timeline planner is creating your schedule...')
        break
      case 'slides':
        toast.success('Slide generator is creating your presentation...')
        break
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <>
      <Head>
        <title>Dashboard - HackEasy</title>
      </Head>
      <div className="grid-bg min-h-screen">
        <NavBar />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h1 className="text-3xl font-bold font-mono mb-2">Build your winning project</h1>
            <p className="text-gray-400">Fill in your hackathon details and let AI do the rest.</p>
          </div>

          <div className="glass-card p-6 mb-8" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s forwards' }}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <FormField label="Hackathon Name *">
                <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="e.g. HackMIT 2026" />
              </FormField>
              <FormField label="Duration">
                <select value={form.duration} onChange={(e) => updateForm('duration', Number(e.target.value))}>
                  {DURATIONS.map(d => (
                    <option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Track / Theme">
                <input value={form.track} onChange={(e) => updateForm('track', e.target.value)} placeholder="e.g. Education, Climate, Health..." />
              </FormField>
              <FormField label="Tech Stack">
                <input value={form.tech} onChange={(e) => updateForm('tech', e.target.value)} placeholder="e.g. React, Python, TensorFlow" />
              </FormField>
              <FormField label="Team Members">
                <textarea value={form.team} onChange={(e) => updateForm('team', e.target.value)} placeholder="One name per line" rows={3} />
              </FormField>
              <FormField label="Existing Idea">
                <textarea value={form.idea} onChange={(e) => updateForm('idea', e.target.value)} placeholder="Paste your idea here (optional)" rows={3} />
              </FormField>
            </div>
            <button onClick={submitForm} disabled={loading} className="btn-primary w-full mt-2 py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating winning project...
                </span>
              ) : 'Generate Winning Project'}
            </button>
          </div>

          {statuses && (
            <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Overall Progress</span>
                  <span className="text-xs font-mono text-[#8A61FF]">
                    {Object.values(statuses).filter(s => s === 'completed').length}/{Object.keys(statuses).length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8A61FF] to-[#A78BFA] rounded-full transition-all duration-700"
                    style={{ width: `${(Object.values(statuses).filter(s => s === 'completed').length / Object.keys(statuses).length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <ProgressTimeline statuses={statuses} />
                <div className="glass-card p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#8A61FF] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">AI is building your project</p>
                    <p className="text-xs text-gray-600 mt-1">This usually takes 1-2 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="glass-card p-6 mb-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-bold font-mono">Project Ready</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{result.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{result.description}</p>
                  </div>

                  {result.techStack && result.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.techStack.map((tech, i) => (
                        <span key={i} className="text-xs bg-[#8A61FF]/10 border border-[#8A61FF]/20 text-[#8A61FF] px-3 py-1 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {[
                      { label: 'GitHub Repo', url: result.githubRepo, icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
                      { label: 'Live Demo', url: result.vercelUrl, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                      { label: 'Pitch Deck', url: result.pitchDeckUrl, icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
                      { label: 'Video Demo', url: result.videoUrl, icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                    ].map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="glass-card p-3 flex items-center gap-3 hover:border-[#8A61FF] transition-all group">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#8A61FF] transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d={link.icon} />
                        </svg>
                        <span className="text-xs text-gray-400 group-hover:text-white transition-colors truncate">{link.label}</span>
                      </a>
                    ))}
                  </div>

                  {result.judgeScores && (
                    <div className="glass-card p-4">
                      <h4 className="text-sm font-semibold mb-3">Judge Score Summary</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(result.judgeScores).map(([key, score]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg font-bold font-mono text-[#8A61FF]">{score}</div>
                            <div className="text-[10px] text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.submissionSummary && (
                    <div className="relative">
                      <textarea
                        readOnly
                        value={result.submissionSummary}
                        className="text-sm text-gray-300 pr-10 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() => copyToClipboard(result.submissionSummary)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                        title="Copy summary"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards' }}>
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h2 className="text-xl font-bold font-mono">Quick Tools</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {QUICK_TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleQuickTool(tool.id)}
                      className="glass-card p-4 text-left hover:border-[#8A61FF] transition-all group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8A61FF]/20 transition-colors">
                          <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold group-hover:text-[#8A61FF] transition-colors">{tool.label}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!statuses && (
            <div className="mb-8" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards' }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h2 className="text-xl font-bold font-mono">Quick Tools</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {QUICK_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleQuickTool(tool.id)}
                    className="glass-card p-4 text-left hover:border-[#8A61FF] transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8A61FF]/20 transition-colors">
                        <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold group-hover:text-[#8A61FF] transition-colors">{tool.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <IdeaModal isOpen={showIdeaModal} onClose={() => setShowIdeaModal(false)} onUseIdea={useIdea} />
        <JudgeSimulator isOpen={showJudgeModal} onClose={() => setShowJudgeModal(false)} />
      </div>
    </>
  )
}
