import { useState, useEffect } from 'react'

const STEPS = [
  { id: 'analyze', label: 'Analyzing rubric', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'idea', label: 'Generating idea', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'code', label: 'Building code', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'deploy', label: 'Deploying', icon: 'M5 12h14M12 5l7 7-7 7' },
  { id: 'pitch', label: 'Creating pitch', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { id: 'video', label: 'Rendering video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'judge', label: 'Running judge sim', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'finalize', label: 'Finalizing', icon: 'M5 13l4 4L19 7' },
]

export default function ProgressTimeline({ statuses }) {
  const [visibleSteps, setVisibleSteps] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => setVisibleSteps(STEPS.map(s => s.id)), 100)
    return () => clearTimeout(timer)
  }, [])

  const getStatus = (stepId) => {
    if (!statuses) return 'pending'
    return statuses[stepId] || 'pending'
  }

  const getDotColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]'
      case 'running': return 'bg-[#8A61FF] shadow-[0_0_12px_rgba(138,97,255,0.5)] animate-pulse'
      case 'failed': return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
      default: return 'bg-gray-600'
    }
  }

  const getLineColor = (stepId, nextStatus) => {
    if (nextStatus === 'completed') return 'bg-green-500/30'
    return 'bg-gray-700'
  }

  return (
    <div className="glass-card p-6" style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}>
      <h3 className="text-lg font-bold font-mono mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Build Pipeline
      </h3>
      <div className="space-y-0">
        {STEPS.map((step, idx) => {
          const status = getStatus(step.id)
          const nextStep = STEPS[idx + 1]
          const nextStatus = nextStep ? getStatus(nextStep.id) : null
          return (
            <div key={step.id} className="relative flex items-start gap-4 pb-2">
              {idx < STEPS.length - 1 && (
                <div className={`absolute left-[11px] top-6 w-[2px] h-full ${getLineColor(step.id, nextStatus)}`} />
              )}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${getDotColor(status)}`}>
                {status === 'completed' ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : status === 'running' ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                ) : null}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${status === 'completed' ? 'text-green-400' : status === 'running' ? 'text-[#8A61FF]' : status === 'failed' ? 'text-red-400' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {status === 'running' && (
                    <div className="w-4 h-4 border-2 border-[#8A61FF] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {status === 'running' && (
                  <p className="text-xs text-gray-500 mt-1">Processing...</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
