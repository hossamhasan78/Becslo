'use client'

import { motion } from 'framer-motion'
import { WIZARD_STEPS } from '@/types/wizard'

interface ProgressBarProps {
  currentStep: number
  highestCompletedStep: number
  setCurrentStep: (step: number) => void
  totalSteps?: number
}

export function ProgressBar({ currentStep, highestCompletedStep, setCurrentStep, totalSteps = 6 }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100
  
  return (
    <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label="Wizard progress">
      <nav aria-label="Progress" className="mb-4">
        <ol className="flex flex-wrap gap-1 md:gap-2">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = step.id !== currentStep && step.id <= highestCompletedStep
            const isClickable = step.id <= highestCompletedStep || step.id <= currentStep
            const isCurrent = step.id === currentStep

            return (
              <li key={step.id} className="flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  disabled={!isClickable}
                  className={`
                    flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-xs md:text-sm font-medium
                    transition-colors duration-200
                    ${isClickable
                      ? isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : isCompleted
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                  title={step.title}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-zinc-900 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  )
}