import { useState, useEffect } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'health', name: 'Health & Wellness', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', desc: 'Healthcare solutions, medical devices, mental health, fitness tracking' },
  { id: 'productivity', name: 'Productivity & Tools', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0', desc: 'Workflow automation, developer tools, time management, collaboration' },
  { id: 'education', name: 'Education & Learning', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', desc: 'E-learning platforms, tutoring, study aids, interactive learning' },
  { id: 'entertainment', name: 'Entertainment & Fun', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0', desc: 'Games, creative tools, interactive experiences, AR/VR' },
  { id: 'safety', name: 'Safety & Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', desc: 'Physical safety, cybersecurity, privacy, emergency response' },
  { id: 'environment', name: 'Environment & Climate', icon: 'M3.015 15l4.31 2.5 4.155-7.5L12.5 15l4-8 4.485 5', desc: 'Sustainability tracking, energy conservation, climate monitoring, recycling' },
  { id: 'social', name: 'Social & Community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', desc: 'Social platforms, volunteering, civic engagement, community building' },
  { id: 'finance', name: 'Finance & Fintech', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Personal finance, payments, budgeting, investment tools' },
  { id: 'communication', name: 'Communication', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', desc: 'Messaging, translation, collaboration tools, social audio' },
  { id: 'data', name: 'Data & Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', desc: 'Dashboards, visualization, business intelligence, predictive analytics' },
]

const TOP_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o-mini (Free via HackAI)' },
  { id: 'anthropic/claude-3-5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet' },
  { id: 'google/gemini-2.0-flash-exp', name: 'Google: Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B' },
]

const ALL_MODELS = [
  { id: 'auto-router', name: 'Auto-Select (HackAI Proxy)' },
  ...TOP_MODELS,
  { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o' },
  { id: 'anthropic/claude-3-opus', name: 'Anthropic: Claude 3 Opus' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek: V3' },
  { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek: R1' },
]

const SETTINGS_PASSWORD = 'hackeasy'

const TABS = [
  { id: 'rubric', label: 'Rubric' },
  { id: 'track', label: 'Track' },
  { id: 'judging', label: 'Judging' },
  { id: 'categories', label: 'Ideas' },
  { id: 'saved', label: 'Saved' },
]

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

function ScoreBar({ label, score, color }) {
  const barColor = color || (score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-amber-400' : 'bg-red-400')
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-mono text-gray-400 w-7 text-right">{score}</span>
    </div>
  )
}

function NavBar({ onOpenSettings }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[rgb(15,23,42)]/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#8A61FF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-lg font-bold font-mono">HackEasy</span>
          <span className="hidden sm:inline text-sm text-gray-500 ml-2">/ Idea Generator</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenSettings} className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </a>
        </div>
      </div>
    </nav>
  )
}

function TabBar({ tabs, active, onTabChange }) {
  return (
    <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 flex-shrink-0 ${
            active === tab.id
              ? 'border-[#8A61FF] text-[#8A61FF]'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function RubricTab({ rubric, setRubric, rubricSaved, onSave }) {
  const [localRubric, setLocalRubric] = useState(rubric)

  const handleSave = () => {
    onSave(localRubric)
    toast.success('Rubric saved')
  }

  const handleSkip = () => {
    onSave('')
    toast('Skipped rubric — AI will generate broadly')
  }

  return (
    <div className="glass-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold font-mono">Rubric & Guidelines</h2>
          <p className="text-xs text-gray-500">Paste the hackathon rubric so AI generates rubric-aligned ideas</p>
        </div>
        {rubricSaved && (
          <span className="ml-auto text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">Saved</span>
        )}
      </div>
      <textarea
        value={localRubric}
        onChange={(e) => setLocalRubric(e.target.value)}
        placeholder={`Paste the hackathon rubric, judging criteria, or theme description here...`}
        rows={6}
        className="mt-4 w-full"
      />
      <div className="flex items-center gap-3 mt-4">
        <button onClick={handleSave} className="btn-primary text-sm px-6 py-2">Save Rubric</button>
        <button onClick={handleSkip} className="btn-outline text-sm px-6 py-2">Skip</button>
      </div>
    </div>
  )
}

function TrackTab({ track, onChange }) {
  return (
    <div className="glass-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold font-mono">Project Track</h2>
          <p className="text-xs text-gray-500">What type of project are you building?</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <button
          onClick={() => onChange('software')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            track === 'software'
              ? 'border-[#8A61FF] bg-[#8A61FF]/10'
              : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
          }`}
        >
          <svg className={`w-8 h-8 mx-auto mb-3 ${track === 'software' ? 'text-[#8A61FF]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className={`font-semibold mb-1 ${track === 'software' ? 'text-[#8A61FF]' : 'text-gray-300'}`}>Software</h3>
          <p className="text-xs text-gray-500">Web apps, mobile apps, AI/ML, APIs, tools</p>
        </button>
        <button
          onClick={() => onChange('hardware')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            track === 'hardware'
              ? 'border-[#8A61FF] bg-[#8A61FF]/10'
              : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
          }`}
        >
          <svg className={`w-8 h-8 mx-auto mb-3 ${track === 'hardware' ? 'text-[#8A61FF]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
          </svg>
          <h3 className={`font-semibold mb-1 ${track === 'hardware' ? 'text-[#8A61FF]' : 'text-gray-300'}`}>Hardware</h3>
          <p className="text-xs text-gray-500">IoT, robotics, wearables, embedded systems</p>
        </button>
      </div>
    </div>
  )
}

function JudgingTab({ judging, onChange }) {
  return (
    <div className="glass-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold font-mono">Judging Type</h2>
          <p className="text-xs text-gray-500">How will projects be evaluated?</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <button
          onClick={() => onChange('peer-voted')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            judging === 'peer-voted'
              ? 'border-[#8A61FF] bg-[#8A61FF]/10'
              : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
          }`}
        >
          <svg className={`w-8 h-8 mx-auto mb-3 ${judging === 'peer-voted' ? 'text-[#8A61FF]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          <h3 className={`font-semibold mb-1 ${judging === 'peer-voted' ? 'text-[#8A61FF]' : 'text-gray-300'}`}>Peer-Voted</h3>
          <p className="text-xs text-gray-500">Popularity, fun factor, wow effect matter most</p>
        </button>
        <button
          onClick={() => onChange('judge-judged')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            judging === 'judge-judged'
              ? 'border-[#8A61FF] bg-[#8A61FF]/10'
              : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
          }`}
        >
          <svg className={`w-8 h-8 mx-auto mb-3 ${judging === 'judge-judged' ? 'text-[#8A61FF]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0-.124 4.91 60.604 60.604 0 0 1-.124-4.91m4.26-5.003a60.346 60.346 0 0 1 7.245 0l1.38.126a60.653 60.653 0 0 1 4.319.706 10.5 10.5 0 0 0-4.069-1.475 60.396 60.396 0 0 0-7.245 0 10.5 10.5 0 0 0-4.069 1.475A60.655 60.655 0 0 1 9.52 4.07l1.38-.126zm-1.38 9.755a10.5 10.5 0 0 1 7.245 0l1.38.126a60.346 60.346 0 0 1 4.319.706 10.5 10.5 0 0 0-4.069-1.475 60.396 60.396 0 0 0-7.245 0 10.5 10.5 0 0 0-4.069 1.475 60.655 60.655 0 0 1 4.319-.706l1.38-.126z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          <h3 className={`font-semibold mb-1 ${judging === 'judge-judged' ? 'text-[#8A61FF]' : 'text-gray-300'}`}>Judge-Judged</h3>
          <p className="text-xs text-gray-500">Technical depth, impact, presentation matter most</p>
        </button>
      </div>
    </div>
  )
}

function IdeaCard({ idea, categoryName, onSave, onBuild, isSaved }) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 mt-3" style={{ animation: 'slideInRight 0.3s ease-out' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="text-base font-bold text-white">{idea.title}</h4>
          {categoryName && <span className="text-[10px] text-[#8A61FF] font-mono">{categoryName}</span>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-gray-400 font-mono">WIS</span>
          <span className="text-lg font-bold font-mono text-[#8A61FF]">{idea.wis_score || idea.wis || 0}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{idea.description}</p>
      <div className="space-y-1 mb-4">
        <ScoreBar label="Pain" score={idea.pain_score || idea.pain || 0} />
        <ScoreBar label="Novelty" score={idea.novelty_score || idea.novelty || 0} />
        <ScoreBar label="Feasibility" score={idea.feasibility_score || idea.feasibility || 0} />
        <ScoreBar label="Alignment" score={idea.alignment_score || idea.alignment || 0} />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSave(idea)}
          className={`text-xs px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
            isSaved
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'border-gray-600 text-gray-300 hover:border-[#8A61FF] hover:text-[#8A61FF]'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {isSaved ? 'Saved' : 'Save Idea'}
        </button>
        <button
          onClick={() => onBuild(idea)}
          className="text-xs px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-[#8A61FF] hover:text-[#8A61FF] transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          How to build this?
        </button>
      </div>
    </div>
  )
}

function CategoriesTab({ ideas, loading, rubricSaved, rubric, track, judging, onGenerate, onGenerateAll, onResetAll, onSaveIdea, onBuildIdea, savedIdeas }) {
  const hasIdeas = Object.values(ideas).some(arr => arr && arr.length > 0)

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-mono">Categories</h2>
            <p className="text-xs text-gray-500 mt-1">Generate winning hackathon ideas for any category</p>
          </div>
          <div className="flex items-center gap-2">
            {hasIdeas && (
              <button onClick={onResetAll} className="btn-outline text-sm px-4 py-2.5 text-red-400 border-red-400/30 hover:bg-red-500/10 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All
              </button>
            )}
            <button
              onClick={onGenerateAll}
              disabled={loading['all']}
              className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
            >
              {loading['all'] ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              Generate All
            </button>
          </div>
        </div>
        {rubricSaved && rubric && (
          <div className="mt-3 text-xs text-gray-500 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
            Using saved rubric
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${track === 'hardware' ? 'bg-[#8A61FF]' : 'bg-gray-600'}`} />
            Track: {track === 'hardware' ? 'Hardware' : 'Software'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${judging === 'peer-voted' ? 'bg-amber-400' : 'bg-blue-400'}`} />
            Judging: {judging === 'peer-voted' ? 'Peer-Voted' : 'Judge-Judged'}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="glass-card p-5 group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{cat.name}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{cat.desc}</p>
              </div>
              <button
                onClick={() => onGenerate(cat.id)}
                disabled={loading[cat.id]}
                className={`btn-outline text-[10px] px-3 py-1.5 flex items-center gap-1 flex-shrink-0 ${
                  ideas[cat.id]?.length ? 'border-green-500/30 text-green-400' : ''
                }`}
              >
                {loading[cat.id] ? (
                  <div className="w-3 h-3 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
                ) : ideas[cat.id]?.length ? (
                  <span>Regenerate</span>
                ) : (
                  <span>Generate</span>
                )}
              </button>
            </div>
            {(ideas[cat.id] || []).map((idea, i) => (
              <IdeaCard
                key={i}
                idea={idea}
                categoryName={cat.name}
                onSave={onSaveIdea}
                onBuild={onBuildIdea}
                isSaved={savedIdeas.some(s => s.title === idea.title)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SavedTab({ savedIdeas, onRemoveIdea, onBuildIdea, onExportIdeas, onClearAll }) {
  if (savedIdeas.length === 0) {
    return (
      <div className="glass-card p-12 text-center" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h3 className="text-lg font-bold font-mono mb-2">No saved ideas yet</h3>
        <p className="text-sm text-gray-500">Generate ideas and save the ones you like. They will appear here.</p>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-mono">Saved Ideas ({savedIdeas.length})</h2>
            <p className="text-xs text-gray-500 mt-1">Your bookmarked hackathon ideas — persisted across sessions</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onExportIdeas} className="btn-outline text-xs px-4 py-2">Export</button>
            <button onClick={onClearAll} className="btn-outline text-xs px-4 py-2 text-red-400 border-red-400/30 hover:bg-red-500/10">Clear All</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {savedIdeas.map((idea, i) => (
          <div key={i} className="glass-card p-5" style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.05}s` }}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-bold">{idea.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {idea.category && <span className="text-[10px] text-[#8A61FF] font-mono">{idea.category}</span>}
                  {idea.wis_score && (
                    <span className="text-[10px] text-gray-400 font-mono">WIS: {idea.wis_score}</span>
                  )}
                  <span className="text-[10px] text-gray-500">{idea.savedAt || ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => onBuildIdea(idea)} className="btn-outline text-[10px] px-3 py-1.5">Build</button>
                <button onClick={() => onRemoveIdea(i)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{idea.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BuildModal({ idea, onClose }) {
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInstructions = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/orchestrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'build-instructions',
            config: {
              title: idea.title,
              description: idea.description,
              track: idea.track || 'software',
              judging: idea.judging || 'judge-judged',
            }
          })
        })
        const data = await res.json()
        setInstructions(data.instructions || data.content || 'No instructions available.')
      } catch {
        setInstructions('Failed to load instructions. Please try again.')
      }
      setLoading(false)
    }
    fetchInstructions()
  }, [idea])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-mono">How to Build This</h3>
            <p className="text-xs text-gray-500 mt-0.5">{idea.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Generating implementation guide...</p>
              <p className="text-xs text-gray-600 mt-1">Analyzing your idea against hackathon best practices</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(instructions) }} />
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsModal({ onClose, selectedModel, onModelChange, apiKey, onApiKeyChange }) {
  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [showModels, setShowModels] = useState(false)

  const handleUnlock = () => {
    if (pw === SETTINGS_PASSWORD) {
      setUnlocked(true)
      setShowModels(true)
      toast.success('Settings unlocked')
    } else {
      toast.error('Incorrect password')
    }
  }

  const handleChangeModel = (modelId) => {
    onModelChange(modelId)
    toast.success('Model updated')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-bold font-mono">Settings</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {!unlocked && (
            <div className="space-y-2">
              <label>Password</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter password to unlock model selection"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
                <button onClick={handleUnlock} className="btn-primary text-sm px-5 py-2 whitespace-nowrap">Unlock</button>
              </div>
              <p className="text-[10px] text-gray-600">Default password: <span className="font-mono text-gray-500">hackeasy</span></p>
            </div>
          )}

          {showModels && (
            <>
              <div className="space-y-2">
                <label>AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleChangeModel(e.target.value)}
                  className="text-sm"
                >
                  {ALL_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500">
                  {selectedModel === 'auto-router' ? 'Auto Router uses HackAI (free, no API key needed)' : 'Uses OpenRouter (enter API key below)'}
                </p>
              </div>

              <div className="space-y-2">
                <label>OpenRouter API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder={apiKey ? 'Key saved' : 'Enter for OpenRouter models'}
                  className="text-sm"
                />
                <p className="text-[10px] text-gray-500">Only needed for non-default models. Stored locally.</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-medium mb-2">Current Model</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#8A61FF]">
                    {ALL_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
                  </span>
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IdeaGenerator() {
  const [activeTab, setActiveTab] = useState('categories')
  const [rubric, setRubric] = useState('')
  const [rubricSaved, setRubricSaved] = useState(false)
  const [track, setTrack] = useState('software')
  const [judging, setJudging] = useState('judge-judged')
  const [ideas, setIdeas] = useState({})
  const [loading, setLoading] = useState({})
  const [savedIdeas, setSavedIdeas] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [selectedModel, setSelectedModel] = useState('auto-router')
  const [apiKey, setApiKey] = useState('')
  const [buildIdea, setBuildIdea] = useState(null)
  const [settingsKey, setSettingsKey] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('hackeasy-saved-ideas')
    if (saved) {
      try { setSavedIdeas(JSON.parse(saved)) } catch {}
    }
    const model = localStorage.getItem('hackeasy-model')
    if (model) setSelectedModel(model)
    const key = localStorage.getItem('hackeasy-api-key')
    if (key) setApiKey(key)
  }, [])

  useEffect(() => {
    localStorage.setItem('hackeasy-saved-ideas', JSON.stringify(savedIdeas))
  }, [savedIdeas])

  useEffect(() => {
    localStorage.setItem('hackeasy-model', selectedModel)
  }, [selectedModel])

  useEffect(() => {
    localStorage.setItem('hackeasy-api-key', apiKey)
  }, [apiKey])

  const generateIdeas = async (categoryId) => {
    const cat = CATEGORIES.find(c => c.id === categoryId)
    if (!cat) return

    setLoading(prev => ({ ...prev, [categoryId]: true }))

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate-ideas',
          config: {
            category: cat.name,
            track,
            judging,
            rubric: rubricSaved ? rubric : '',
            model: selectedModel,
            apiKey,
          }
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      if (data.ideas && data.ideas.length > 0) {
        setIdeas(prev => ({ ...prev, [categoryId]: data.ideas }))
        toast.success(`Ideas generated for ${cat.name}`)
      } else {
        toast.error('No ideas returned. Try again.')
      }
    } catch (err) {
      toast.error(`Failed: ${err.message}`)
    }

    setLoading(prev => ({ ...prev, [categoryId]: false }))
  }

  const handleSetTrack = (newTrack) => {
    if (newTrack !== track) {
      setIdeas({})
      toast('Cleared ideas — track changed')
    }
    setTrack(newTrack)
  }

  const handleSetJudging = (newJudging) => {
    if (newJudging !== judging) {
      setIdeas({})
      toast('Cleared ideas — judging type changed')
    }
    setJudging(newJudging)
  }

  const resetAll = () => {
    setIdeas({})
    toast('All generated ideas cleared')
  }

  const generateAll = async () => {
    setLoading(prev => ({ ...prev, ['all']: true }))

    try {
      await Promise.all(CATEGORIES.map(cat => {
        if (!ideas[cat.id] || ideas[cat.id].length === 0) {
          return generateIdeas(cat.id)
        }
        return Promise.resolve()
      }))
      toast.success('Generated ideas for all categories')
    } catch (err) {
      toast.error('Some generations failed')
    }

    setLoading(prev => ({ ...prev, ['all']: false }))
  }

  const saveIdea = (idea) => {
    if (savedIdeas.some(s => s.title === idea.title)) {
      setSavedIdeas(prev => prev.filter(s => s.title !== idea.title))
      toast('Idea removed from saved')
      return
    }
    const saved = {
      ...idea,
      category: idea.category || '',
      savedAt: new Date().toLocaleDateString(),
    }
    setSavedIdeas(prev => [saved, ...prev])
    toast.success('Idea saved!')
  }

  const removeIdea = (index) => {
    setSavedIdeas(prev => prev.filter((_, i) => i !== index))
    toast('Idea removed')
  }

  const clearAllIdeas = () => {
    setSavedIdeas([])
    toast('All saved ideas cleared')
  }

  const exportIdeas = () => {
    const text = savedIdeas.map(i =>
      `## ${i.title}\n${i.description}\nWIS: ${i.wis_score || 'N/A'}\nSaved: ${i.savedAt || 'N/A'}\n`
    ).join('\n---\n')

    if (!text) { toast.error('No ideas to export'); return }

    navigator.clipboard.writeText(text)
    toast.success('Saved ideas copied to clipboard')
  }

  return (
    <>
      <Head>
        <title>Idea Generator - HackEasy</title>
      </Head>
      <div className="grid-bg min-h-screen">
        <NavBar onOpenSettings={() => setShowSettings(true)} />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <div className="mb-6" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h1 className="text-3xl font-bold font-mono mb-2">Idea Generator</h1>
            <p className="text-gray-400">Generate winning hackathon ideas. Save the best ones. Let the AI guide your build.</p>
          </div>

          <TabBar tabs={TABS} active={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'rubric' && (
            <RubricTab
              rubric={rubric}
              setRubric={setRubric}
              rubricSaved={rubricSaved}
              onSave={(text) => { setRubric(text); setRubricSaved(!!text) }}
            />
          )}

          {activeTab === 'track' && (
            <TrackTab track={track} onChange={handleSetTrack} />
          )}

          {activeTab === 'judging' && (
            <JudgingTab judging={judging} onChange={handleSetJudging} />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              ideas={ideas}
              loading={loading}
              rubricSaved={rubricSaved}
              rubric={rubric}
              track={track}
              judging={judging}
              onGenerate={generateIdeas}
              onGenerateAll={generateAll}
              onResetAll={resetAll}
              onSaveIdea={saveIdea}
              onBuildIdea={setBuildIdea}
              savedIdeas={savedIdeas}
            />
          )}

          {activeTab === 'saved' && (
            <SavedTab
              savedIdeas={savedIdeas}
              onRemoveIdea={removeIdea}
              onBuildIdea={setBuildIdea}
              onExportIdeas={exportIdeas}
              onClearAll={clearAllIdeas}
            />
          )}
        </main>
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
        />
      )}

      {buildIdea && (
        <BuildModal
          idea={{ ...buildIdea, track, judging }}
          onClose={() => setBuildIdea(null)}
        />
      )}
    </>
  )
}
