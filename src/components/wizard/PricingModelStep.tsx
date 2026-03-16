'use client'

import { useWizard } from '@/components/WizardContext'
import { validatePricingModel } from '@/lib/validation'
import { useEffect } from 'react'

export function PricingModelStep() {
  const { input, updateInput, setError, clearError, errors } = useWizard()

  useEffect(() => {
    if (input.pricingModel) {
      clearError('pricingModel')
    }
  }, [input.pricingModel, clearError])

  const handleSelect = (model: 'hourly' | 'project') => {
    updateInput({ pricingModel: model })
    const validation = validatePricingModel(model)
    if (!validation.isValid) {
      setError('pricingModel', validation.error || 'Invalid')
    } else {
      clearError('pricingModel')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Pricing Model</h2>
      {errors.pricingModel && (
        <p className="text-red-500 text-sm">{errors.pricingModel}</p>
      )}
      <div className="grid gap-4">
        <label className={`border p-4 rounded-lg cursor-pointer transition-colors ${input.pricingModel === 'hourly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input
            type="radio"
            name="pricingModel"
            value="hourly"
            checked={input.pricingModel === 'hourly'}
            onChange={() => handleSelect('hourly')}
            className="sr-only"
          />
          <div className="font-medium">Hourly Rate</div>
          <div className="text-sm text-gray-500">Charge based on hours worked</div>
        </label>
        <label className={`border p-4 rounded-lg cursor-pointer transition-colors ${input.pricingModel === 'project' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input
            type="radio"
            name="pricingModel"
            value="project"
            checked={input.pricingModel === 'project'}
            onChange={() => handleSelect('project')}
            className="sr-only"
          />
          <div className="font-medium">Fixed Price</div>
          <div className="text-sm text-gray-500">One price for the entire project</div>
        </label>
      </div>
    </div>
  )
}
