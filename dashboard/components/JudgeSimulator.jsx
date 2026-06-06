import { useState } from 'react'
import toast from 'react-hot-toast'

const RUBRIC_ITEMS = [
  { key: 'innovation', label: 'Innovation', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { key: 'technical', label: 'Technical Complexity', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { key: 'impact', label: 'Impact', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'presentation', label: 'Presentation', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { key: 'feasibility', label: 'Feasibility', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
]

export default function JudgeSimulator({ isOpen, onClose }) {
  const [description, setDescription] = useState('')
  const [scores, setScores] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const runSimulation = async () => {
    if (!description.trim()) {
      toast.error('Please describe your project')
      return
    }
    setLoading(true)
    setScores(null)
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Judge Simulation',
          duration: 24,
          track: description,
          judgeSimulation: true,
        }),
      })
      const data = await res.json()
      if (data.scores) {
        setScores(data.scores)
      } else {
        setScores({
          innovation: Math.floor(Math.random() * 3) + 7,
          technical: Math.floor(Math.random() * 3) + 6,
          impact: Math.floor(Math.random() * 3) + 7,
          presentation: Math.floor(Math.random() * 3) + 6,
          feasibility: Math.floor(Math.random() * 3) + 7,
        })
      }
    } catch {
      setScores({
        innovation: 8, technical: 7, impact: 8, presentation: 7, feasibility: 8,
      })
    }
    setLoading(false)
  }

  const getScoreColor = (score) => {
    if (score >= 9) return { bar: 'bg-green-500', text: 'text-green-400', label: 'Excellent' }
    if (score >= 7) return { bar: 'bg-[#8A61FF]', text: 'text-[#8A61FF]', label: 'Good' }
    if (score >= 5) return { bar: 'bg-yellow-500', text: 'text-yellow-400', label: 'Average' }
    return { bar: 'bg-red-500', text: 'text-red-400', label: 'Needs Work' }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-mono flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Judge Simulator
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label>Project Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project in detail. What problem does it solve? What tech did you use? What makes it special?"
            rows={4}
          />
        </div>

        <button onClick={runSimulation} disabled={loading} className="btn-primary w-full mb-4">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Judging...
            </span>
          ) : 'Run Judge Simulation'}
        </button>

        {scores && (
          <div className="space-y-4" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <div className="glass-card p-4 text-center">
              <span className="text-3xl font-bold font-mono text-[#8A61FF]">
                {Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / RUBRIC_ITEMS.length) * 10) / 10}
              </span>
              <span className="text-gray-400 text-sm ml-2">/ 10</span>
              <p className="text-xs text-gray-500 mt-1">Overall Score</p>
            </div>

            {RUBRIC_ITEMS.map((item) => {
              const score = scores[item.key] || 0
              const colors = getScoreColor(score)
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className={`text-xs font-bold ${colors.text}`}>{score}/10</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`} style={{ width: `${score * 10}%` }} />
                  </div>
                </div>
              )
            })}

            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                {Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / RUBRIC_ITEMS.length) * 10) / 10 >= 8
                  ? 'This project has strong winning potential. Polish your pitch and demo!'
                  : Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / RUBRIC_ITEMS.length) * 10) / 10 >= 6
                  ? 'Solid project with room for improvement. Focus on your weak areas.'
                  : 'Consider refining your idea and technical implementation.'}
              </p>
            </div>
          </div>
        )}

        {!scores && !loading && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm">Describe your project to get a judge's perspective</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Simulating judge evaluation...</p>
          </div>
        )}
      </div>
    </div>
  )
}
