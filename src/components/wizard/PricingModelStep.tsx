'use client'

import { useWizard } from '@/components/WizardContext'

export function PricingModelStep() {
  const { input, updateInput } = useWizard()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Pricing Model</h2>
      <div className="grid gap-4">
        <label className={`border p-4 rounded-lg cursor-pointer transition-colors ${input.pricingModel === 'hourly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input
            type="radio"
            name="pricingModel"
            value="hourly"
            checked={input.pricingModel === 'hourly'}
            onChange={() => updateInput({ pricingModel: 'hourly' })}
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
            onChange={() => updateInput({ pricingModel: 'project' })}
            className="sr-only"
          />
          <div className="font-medium">Fixed Price</div>
          <div className="text-sm text-gray-500">One price for the entire project</div>
        </label>
      </div>
    </div>
  )
}
