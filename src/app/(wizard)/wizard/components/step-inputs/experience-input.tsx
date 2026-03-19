'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { useEffect } from 'react'

export function ExperienceInput() {
  const { state, setExperienceDesigner, setExperienceFreelance } = useWizard()
  const { setPricing, validationErrors, clearValidationErrors, hasErrors } = usePricing()

  const overallError = validationErrors.find(e => e.field === 'designerExperience')?.message
  const freelanceError = validationErrors.find(e => e.field === 'freelanceExperience')?.message

  useEffect(() => {
    setPricing({
      designerExperience: state.experienceDesigner,
      freelanceExperience: state.experienceFreelance
    })
  }, [state.experienceDesigner, state.experienceFreelance, setPricing])

  const handleOverallChange = (value: number) => {
    clearValidationErrors('designerExperience')
    setExperienceDesigner(value)
  }

  const handleFreelanceChange = (value: number) => {
    clearValidationErrors('freelanceExperience')
    setExperienceFreelance(value)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Experience Level</h3>
      
      <div>
        <label htmlFor="overallExperience" className="block text-sm font-medium text-gray-700 mb-2">
          Overall Experience (Years)
        </label>
        <input
          id="overallExperience"
          type="number"
          min="1"
          max="10"
          step="1"
          value={state.experienceDesigner}
          onChange={(e) => handleOverallChange(parseInt(e.target.value) || 1)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            hasErrors('designerExperience') ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="text-xs text-zinc-500 mt-1">Total years of professional experience (1-10)</p>
        {overallError && (
          <p className="text-sm text-red-600 mt-1">{overallError}</p>
        )}
      </div>

      <div>
        <label htmlFor="freelanceExperience" className="block text-sm font-medium text-gray-700 mb-2">
          Freelance Experience (Years)
        </label>
        <input
          id="freelanceExperience"
          type="number"
          min="1"
          max={state.experienceDesigner}
          step="1"
          value={state.experienceFreelance}
          onChange={(e) => handleFreelanceChange(parseInt(e.target.value) || 1)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            hasErrors('freelanceExperience') ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="text-xs text-zinc-500 mt-1">Years of freelance experience (max: {state.experienceDesigner})</p>
        {freelanceError && (
          <p className="text-sm text-red-600 mt-1">{freelanceError}</p>
        )}
      </div>
    </div>
  )
}
