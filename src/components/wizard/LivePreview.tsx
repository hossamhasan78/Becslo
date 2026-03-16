'use client'

import { useWizard } from '@/components/WizardContext'

export function LivePreview() {
  const { result, input, services } = useWizard()

  if (!result) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">Enter details to see your calculation</p>
      </div>
    )
  }

  const selectedServices = input.services.map(s => {
    const category = Object.values(services).flat().find(service => service.id === s.serviceId)
    return { ...s, name: category?.name || 'Unknown Service' }
  })

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h3 className="font-semibold text-lg">Live Preview</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Base Rate:</span>
          <span className="font-medium">${result.baseRate}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Experience Multiplier:</span>
          <span className="font-medium">x{result.experienceMultiplier.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Geography Multiplier:</span>
          <span className="font-medium">x{result.geoMultiplier.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Adjusted Hourly:</span>
          <span className="font-medium">${result.adjustedHourlyRate.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-2 flex justify-between">
          <span className="text-gray-600">Services ({input.services.length}):</span>
          <span className="font-medium">${result.totalHours} hrs</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Base Cost:</span>
          <span className="font-medium">${result.baseCost.toFixed(2)}</span>
        </div>
        
        {input.costs.length > 0 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Overhead:</span>
              <span className="font-medium">${result.overhead.toFixed(2)}</span>
            </div>
            
            {input.costs.map((cost, i) => (
              <div key={i} className="flex justify-between text-xs pl-2">
                <span className="text-gray-500">{cost.name}:</span>
                <span>${cost.amount}</span>
              </div>
            ))}
          </>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">Risk Buffer:</span>
          <span className="font-medium">${result.riskBuffer.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Profit Margin:</span>
          <span className="font-medium">${result.profitMargin.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>Final Price:</span>
          <span className="text-green-600">${result.finalPrice.toLocaleString()}</span>
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="border-t pt-2 mt-2">
          <h4 className="font-medium text-sm mb-1">Selected Services:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {selectedServices.map((service, i) => (
              <li key={i} className="flex justify-between">
                <span>{service.name}</span>
                <span>{service.hours} hrs</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
