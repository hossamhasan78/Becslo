'use client'

import { motion } from 'framer-motion'
import { WIZARD_STEPS } from '@/types/wizard'

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
}

export function ProgressBar({ currentStep, totalSteps = 6 }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100
  
  return (
    <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label="Wizard progress">
      <div className="flex items-center justify-between mb-3">
        {WIZARD_STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => {}}
            disabled
            className={`
              flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all
              ${step.id === currentStep 
                ? 'bg-zinc-900 text-white shadow-lg scale-110' 
                : step.id < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-zinc-100 text-zinc-400'}
            `}
            aria-current={step.id === currentStep ? 'step' : undefined}
          >
            {step.id < currentStep ? '✓' : step.id}
          </button>
        ))}
      </div>
      
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