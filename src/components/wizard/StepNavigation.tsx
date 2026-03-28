'use client'

import { WIZARD_STEPS } from '@/types/wizard'
import { useWizard } from '@/lib/context/WizardContext'

export function StepNavigation() {
  const { state } = useWizard()
  const { currentStep } = state

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-lg font-semibold mb-3 md:mb-4">Steps</h2>
      <div className="mt-4">
        <h3 className="text-lg md:text-xl font-bold">{WIZARD_STEPS[currentStep - 1].title}</h3>
        <p className="text-zinc-600 text-sm md:text-base">{WIZARD_STEPS[currentStep - 1].description}</p>
      </div>
    </div>
  )
}
