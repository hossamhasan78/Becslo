'use client'

import { useWizard } from '@/components/WizardContext'

export function ResultsPreviewStep() {
  const { result, input, services, setStep } = useWizard()

  if (!result) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Results</h2>
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Complete all steps to see your calculation results.</p>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setStep(5)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  const selectedServices = input.services.map(s => {
    const category = Object.values(services).flat().find(service => service.id === s.serviceId)
    return { ...s, name: category?.name || 'Unknown Service' }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Quote</h2>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-sm text-green-700 mb-1">Recommended Price</div>
          <div className="text-4xl font-bold text-green-700">
            ${result.finalPrice.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 mt-1">
            {input.pricingModel === 'hourly' ? `$${result.adjustedHourlyRate.toFixed(0)}/hour` : 'Fixed Price'}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 font-medium">Breakdown</div>
        <div className="divide-y">
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Base Rate</span>
            <span className="font-medium">${result.baseRate}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Experience Multiplier</span>
            <span className="font-medium">x{result.experienceMultiplier.toFixed(2)}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Geography Multiplier</span>
            <span className="font-medium">x{result.geoMultiplier.toFixed(2)}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Adjusted Hourly Rate</span>
            <span className="font-medium">${result.adjustedHourlyRate.toFixed(2)}/hr</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Total Hours</span>
            <span className="font-medium">{result.totalHours} hrs</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Base Cost (Services)</span>
            <span className="font-medium">${result.baseCost.toFixed(2)}</span>
          </div>
          {input.costs.length > 0 && (
            <div className="p-3 flex justify-between">
              <span className="text-gray-600">Overhead Costs</span>
              <span className="font-medium">${result.overhead.toFixed(2)}</span>
            </div>
          )}
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Risk Buffer</span>
            <span className="font-medium">${result.riskBuffer.toFixed(2)}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-gray-600">Profit Margin</span>
            <span className="font-medium">${result.profitMargin.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-medium">Services</div>
          <div className="divide-y">
            {selectedServices.map((service, i) => (
              <div key={i} className="p-3 flex justify-between">
                <span className="text-gray-600">{service.name}</span>
                <span className="font-medium">{service.hours} hrs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setStep(5)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => setStep(7)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}
