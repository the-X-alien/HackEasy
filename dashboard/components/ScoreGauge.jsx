import { useEffect, useState } from 'react'

const SIZE = 180
const STROKE_WIDTH = 10
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ScoreGauge({ score = 0, label = 'Competitiveness' }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  const clampedScore = Math.min(Math.max(score, 0), 10)
  const fraction = clampedScore / 10

  useEffect(() => {
    let frame
    const start = performance.now()
    const duration = 1500

    function animate(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(eased * clampedScore)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [clampedScore])

  const offset = CIRCUMFERENCE * (1 - animatedScore / 10)

  const getColor = (s) => {
    if (s < 6) return '#ef4444'
    if (s < 8) return '#f59e0b'
    return '#22d3ee'
  }

  const getLabel = (s) => {
    if (s < 4) return 'Needs Work'
    if (s < 6) return 'Average'
    if (s < 8) return 'Strong'
    return 'Elite'
  }

  const color = getColor(clampedScore)
  const displayScore = animatedScore.toFixed(1)

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={SIZE} height={SIZE} className="drop-shadow-lg">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE_WIDTH}
        />

        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="transition-all duration-200"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />

        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          fill="#f1f5f9"
          fontSize="38"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {displayScore}
        </text>

        <text
          x={SIZE / 2}
          y={SIZE / 2 + 28}
          textAnchor="middle"
          fill={color}
          fontSize="12"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          / 10
        </text>
      </svg>

      <span
        className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{
          color,
          background: `${color}15`,
          border: `1px solid ${color}30`,
        }}
      >
        {getLabel(clampedScore)}
      </span>
    </div>
  )
}
