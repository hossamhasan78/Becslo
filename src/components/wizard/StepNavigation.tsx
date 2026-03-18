'use client'

import { WIZARD_STEPS } from '@/types/wizard'
import { useWizard } from '@/lib/context/WizardContext'

export function StepNavigation() {
  const { state, setCurrentStep } = useWizard()
  const { currentStep } = state

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Steps</h2>
      <nav aria-label="Progress">
        <ol className="flex flex-wrap gap-2">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep

            return (
              <li key={step.id} className="flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                    transition-colors duration-200
                    ${isCompleted 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    }
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="mt-4">
        <h3 className="text-xl font-bold">{WIZARD_STEPS[currentStep - 1].title}</h3>
        <p className="text-zinc-600">{WIZARD_STEPS[currentStep - 1].description}</p>
      </div>
    </div>
  )
}
