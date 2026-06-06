import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineCog } from 'react-icons/hi'

const icons = {
  rubric: HiOutlineCheckCircle,
  idea: HiOutlineCog,
  code: HiOutlineCog,
  deploy: HiOutlineCog,
  pitch: HiOutlineCog,
  video: HiOutlineCog,
  judge: HiOutlineCog,
  finalize: HiOutlineCheckCircle,
}

const defaultIcon = HiOutlineCog

export default function ProgressTimeline({ steps = [], currentStep = '' }) {
  const completedCount = steps.filter((s) => s.status === 'completed').length
  const totalCount = steps.length
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">Overall Progress</span>
          <span className="text-sm font-mono font-semibold text-cyan-400">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[17px] top-2 bottom-2 w-px bg-white/10" />

        <div className="space-y-0">
          {steps.map((step, index) => {
            const Icon = icons[step.id] || defaultIcon
            const isActive = step.id === currentStep
            const isCompleted = step.status === 'completed'
            const isFailed = step.status === 'failed'
            const isPending = step.status === 'pending'

            let dotColor = 'bg-gray-600'
            let borderColor = 'border-gray-700'
            let iconColor = 'text-gray-500'
            let textColor = 'text-gray-500'
            let bgColor = 'bg-white/5'
            let dotPulse = ''

            if (isCompleted) {
              dotColor = 'bg-green-500'
              borderColor = 'border-green-500/30'
              iconColor = 'text-green-400'
              textColor = 'text-gray-300'
              bgColor = 'bg-green-500/5'
            } else if (isActive) {
              dotColor = 'bg-cyan-400'
              borderColor = 'border-cyan-400/40'
              iconColor = 'text-cyan-400'
              textColor = 'text-gray-100'
              bgColor = 'bg-cyan-500/5'
              dotPulse = 'animate-pulse'
            } else if (isFailed) {
              dotColor = 'bg-red-500'
              borderColor = 'border-red-500/30'
              iconColor = 'text-red-400'
              textColor = 'text-gray-400'
              bgColor = 'bg-red-500/5'
            }

            return (
              <div
                key={step.id}
                className={`relative flex items-start gap-4 py-3 pl-0 transition-all duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
                style={{
                  animation: isActive ? 'slideDown 0.3s ease-out' : 'none',
                }}
              >
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div
                    className={`relative w-[34px] h-[34px] rounded-full border-2 flex items-center justify-center
                                ${borderColor} ${dotColor} ${dotPulse} transition-all duration-500`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                    )}
                    {isCompleted ? (
                      <HiOutlineCheckCircle className={`w-[18px] h-[18px] ${iconColor}`} />
                    ) : (
                      <Icon className={`w-[16px] h-[16px] ${iconColor}`} />
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 min-w-0 px-4 py-3 rounded-xl border transition-all duration-500 ${bgColor} ${borderColor}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${textColor}`}>
                      {step.label}
                    </span>
                    <span className="flex-shrink-0">
                      {isCompleted && (
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          Done
                        </span>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-cyan-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Running
                        </span>
                      )}
                      {isFailed && (
                        <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          Failed
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs font-medium text-gray-500">Pending</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
