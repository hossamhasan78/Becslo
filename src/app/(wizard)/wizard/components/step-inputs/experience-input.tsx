'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { useEffect } from 'react'

export function ExperienceInput() {
  const { state, setExperienceDesigner, setExperienceFreelance } = useWizard()
  const { setPricing } = usePricing()

  useEffect(() => {
    setPricing({
      designerExperience: state.experienceDesigner,
      freelanceExperience: state.experienceFreelance
    })
  }, [state.experienceDesigner, state.experienceFreelance, setPricing])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Experience Level</h3>
      
      <div>
        <label htmlFor="designerExperience" className="block text-sm font-medium text-gray-700 mb-2">
          Designer Experience: <span className="text-zinc-500 ml-1">{state.experienceDesigner}</span>
        </label>
        <input
          id="designerExperience"
          type="range"
          min="1"
          max="10"
          step="1"
          value={state.experienceDesigner}
          onChange={(e) => setExperienceDesigner(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label htmlFor="freelanceExperience" className="block text-sm font-medium text-gray-700 mb-2">
          Freelance Experience: <span className="text-zinc-500 ml-1">{state.experienceFreelance}</span>
        </label>
        <input
          id="freelanceExperience"
          type="range"
          min="1"
          max="10"
          step="1"
          value={state.experienceFreelance}
          onChange={(e) => setExperienceFreelance(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
