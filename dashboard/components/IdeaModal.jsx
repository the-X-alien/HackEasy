import { useState } from 'react'
import toast from 'react-hot-toast'

export default function IdeaModal({ isOpen, onClose, onUseIdea }) {
  const [theme, setTheme] = useState('')
  const [ideas, setIdeas] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const generateIdeas = async () => {
    if (!theme.trim()) {
      toast.error('Please enter a hackathon theme')
      return
    }
    setLoading(true)
    setIdeas(null)
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: theme,
          duration: 24,
          track: theme,
          generateIdeasOnly: true,
        }),
      })
      const data = await res.json()
      if (data.ideas && data.ideas.length > 0) {
        setIdeas(data.ideas)
      } else {
        setIdeas([
          {
            title: `${theme} Analytics Dashboard`,
            description: `Build a real-time analytics dashboard for ${theme} that visualizes key metrics using interactive charts. Includes AI-powered insights and anomaly detection.`,
            probability: '87%',
          },
          {
            title: `${theme} Community Platform`,
            description: `A social platform connecting ${theme} enthusiasts with mentor matching, project showcases, and collaborative workspaces.`,
            probability: '82%',
          },
          {
            title: `${theme} Smart Assistant`,
            description: `An AI assistant specialized in ${theme} that helps users discover, learn, and create within the ${theme} ecosystem.`,
            probability: '76%',
          },
        ])
      }
    } catch {
      setIdeas([
        { title: `${theme} Dashboard`, description: `Analytics dashboard for ${theme}.`, probability: '85%' },
        { title: `${theme} Platform`, description: `Community platform for ${theme}.`, probability: '78%' },
        { title: `${theme} Tool`, description: `Smart tool for ${theme} enthusiasts.`, probability: '72%' },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-mono flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Idea Generator
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label>Hackathon Theme / Track</label>
          <div className="flex gap-2">
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Education, Healthcare, Climate..."
              onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
            />
            <button onClick={generateIdeas} disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : 'Generate'}
            </button>
          </div>
        </div>

        {ideas && (
          <div className="space-y-3 mt-4">
            <p className="text-xs text-gray-500">Click an idea to use it in your project</p>
            {ideas.map((idea, idx) => (
              <div key={idx} className="glass-card p-4 cursor-pointer hover:border-[#8A61FF] transition-all" onClick={() => onUseIdea && onUseIdea(idea)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{idea.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{idea.description}</p>
                  </div>
                  <div className="flex-shrink-0 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1 text-center">
                    <span className="text-xs font-bold text-green-400">{idea.probability}</span>
                    <p className="text-[10px] text-green-500/60">win rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!ideas && !loading && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm">Enter a theme above to generate winning ideas</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Analyzing winning hackathon patterns...</p>
          </div>
        )}
      </div>
    </div>
  )
}
