'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { validatePositiveNumber } from '@/lib/utils/validation'

export function ExperienceInput() {
  const { state, setExperienceDesigner, setExperienceFreelance, validateCurrentStep } = useWizard()

  const validation = validateCurrentStep()
  const overallError = validation.errors.find(e => e.field === 'experienceDesigner')?.message
  const freelanceError = validation.errors.find(e => e.field === 'freelanceExperience')?.message

  const handleOverallChange = (value: number) => {
    const validation = validatePositiveNumber(value)
    if (validation.valid && validation.value !== null) {
      setExperienceDesigner(Math.min(10, Math.max(1, validation.value)))
    }
  }

  const handleFreelanceChange = (value: number) => {
    const validation = validatePositiveNumber(value)
    if (validation.valid && validation.value !== null) {
      setExperienceFreelance(Math.min(state.experienceDesigner, Math.max(1, validation.value)))
    }
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
            overallError ? 'border-red-500' : 'border-gray-300'
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
            freelanceError ? 'border-red-500' : 'border-gray-300'
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
