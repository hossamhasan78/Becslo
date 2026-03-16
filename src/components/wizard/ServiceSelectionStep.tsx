'use client'

import { useWizard } from '@/components/WizardContext'
import { validateHours } from '@/lib/validation'
import { useEffect } from 'react'
import type { ServiceInput } from '@/lib/pricing-engine'

interface ServiceItem {
  id: string
  name: string
  category: string
  default_hours: number
  min_hours: number
  max_hours: number
}

export function ServiceSelectionStep() {
  const { input, updateInput, setError, clearError, errors, services } = useWizard()

  useEffect(() => {
    if (input.services && input.services.length > 0) {
      clearError('services')
    }
  }, [input.services, clearError])

  const toggleService = (service: ServiceItem) => {
    const existing = input.services || []
    const isSelected = existing.some(s => s.serviceId === service.id)
    
    let updated: ServiceInput[]
    if (isSelected) {
      updated = existing.filter(s => s.serviceId !== service.id)
    } else {
      updated = [...existing, { serviceId: service.id, hours: service.default_hours }]
    }
    
    updateInput({ services: updated })
    
    if (updated.length === 0) {
      setError('services', 'Please select at least one service')
    } else {
      clearError('services')
    }
  }

  const updateServiceHours = (serviceId: string, hours: number) => {
    const existing = input.services || []
    const updated = existing.map(s => 
      s.serviceId === serviceId ? { ...s, hours } : s
    )
    updateInput({ services: updated })
    
    const validation = validateHours(hours)
    if (!validation.isValid) {
      setError(`service_${serviceId}`, validation.error || 'Invalid hours')
    } else {
      clearError(`service_${serviceId}`)
    }
  }

  const categories = Object.entries(services)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Services</h2>
      {errors.services && (
        <p className="text-red-500 text-sm">{errors.services}</p>
      )}
      {categories.map(([category, categoryServices]) => (
        <div key={category} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-medium">{category}</div>
          <div className="divide-y">
            {categoryServices.map((service) => {
              const isSelected = (input.services || []).some(s => s.serviceId === service.id)
              const selectedService = input.services?.find(s => s.serviceId === service.id)
              const hours = selectedService?.hours ?? service.default_hours
              
              return (
                <div key={service.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(service)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span>{service.name}</span>
                    </label>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Hours:</label>
                        <input
                          type="number"
                          min={service.min_hours || 0}
                          max={service.max_hours || 1000}
                          value={hours}
                          onChange={(e) => updateServiceHours(service.id, Number(e.target.value))}
                          className={`w-20 px-2 py-1 border rounded ${errors[`service_${service.id}`] ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors[`service_${service.id}`] && (
                          <span className="text-red-500 text-xs">{errors[`service_${service.id}`]}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
