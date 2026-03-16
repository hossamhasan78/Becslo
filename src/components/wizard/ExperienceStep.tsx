'use client'

import { useWizard } from '@/components/WizardContext'
import { validateExperienceYears, roundToNearestHalf } from '@/lib/validation'
import { useEffect } from 'react'

export function ExperienceStep() {
  const { input, updateInput, setError, clearError, errors } = useWizard()

  useEffect(() => {
    if (input.experienceYears !== undefined && input.experienceYears !== null) {
      const validation = validateExperienceYears(input.experienceYears)
      if (!validation.isValid) {
        setError('experienceYears', validation.error || 'Invalid')
      } else {
        clearError('experienceYears')
      }
    }
  }, [input.experienceYears, setError, clearError])

  useEffect(() => {
    if (input.freelanceYears !== undefined && input.freelanceYears !== null) {
      const validation = validateExperienceYears(input.freelanceYears)
      if (!validation.isValid) {
        setError('freelanceYears', validation.error || 'Invalid')
      } else {
        clearError('freelanceYears')
      }
    }
  }, [input.freelanceYears, setError, clearError])

  const handleDesignerYearsChange = (value: number) => {
    const rounded = roundToNearestHalf(value)
    updateInput({ experienceYears: rounded })
  }

  const handleFreelanceYearsChange = (value: number) => {
    const rounded = roundToNearestHalf(value)
    updateInput({ freelanceYears: rounded })
  }

  const designerOptions = [
    { value: 0, label: '0-1 years' },
    { value: 1, label: '1-2 years' },
    { value: 3, label: '3-5 years' },
    { value: 6, label: '6-9 years' },
    { value: 10, label: '10+ years' },
  ]

  const freelanceOptions = [
    { value: 0, label: '0-1 years' },
    { value: 2, label: '2-3 years' },
    { value: 4, label: '4-6 years' },
    { value: 7, label: '7+ years' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Experience Level</h2>
      
      <div>
        <label className="block font-medium mb-2">
          Years of Design Experience
          <span className="text-gray-500 font-normal ml-2">(as a designer)</span>
        </label>
        <select
          value={input.experienceYears || 0}
          onChange={(e) => handleDesignerYearsChange(Number(e.target.value))}
          className={`w-full p-2 border rounded-lg ${errors.experienceYears ? 'border-red-500' : 'border-gray-300'}`}
        >
          {designerOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.experienceYears && (
          <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-2">
          Years of Freelancing Experience
          <span className="text-gray-500 font-normal ml-2">(as a freelancer)</span>
        </label>
        <select
          value={input.freelanceYears || 0}
          onChange={(e) => handleFreelanceYearsChange(Number(e.target.value))}
          className={`w-full p-2 border rounded-lg ${errors.freelanceYears ? 'border-red-500' : 'border-gray-300'}`}
        >
          {freelanceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.freelanceYears && (
          <p className="text-red-500 text-sm mt-1">{errors.freelanceYears}</p>
        )}
      </div>
    </div>
  )
}
