'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState, useEffect, useCallback } from 'react'
import { validatePositiveNumber } from '@/lib/utils/validation'

interface ServiceData {
  id: number
  name: string
  defaultHours: number
  minHours: number
  maxHours: number
}

export function ServiceSelection() {
  const { state, addService, removeService, updateServiceHours, validateCurrentStep } = useWizard()
  const [services, setServices] = useState<ServiceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/v1/services')

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`)
      }

      const data = await response.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setError('Unable to load services. Please try again.')
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Removal of legacy sync useEffect


  const handleServiceToggle = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return
    
    const isSelected = state.services.some(s => s.id === serviceId)
    
    if (isSelected) {
      removeService(serviceId)
    } else {
      addService({ id: serviceId, hours: Number(service.defaultHours) || 1, adjustedRate: 0, cost: 0 })
    }
  }

  const handleHoursChange = (serviceId: number, hours: number) => {
    const validation = validatePositiveNumber(hours)
    if (validation.valid && validation.value !== null) {
      updateServiceHours(serviceId, validation.value)
    }
  }

  const validation = validateCurrentStep()
  const servicesError = validation.errors.find(e => e.field === 'services')?.message
  const hasServiceError = !!servicesError

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Select Services</h3>

      {isLoading && (
        <p className="text-zinc-500">Loading services...</p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-2 text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-2">
          {services.map(service => {
            const selectedService = state.services.find(s => s.id === service.id)

            return (
              <div
                key={service.id}
                className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                  hasServiceError ? 'border-red-300' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={!!selectedService}
                    onChange={() => handleServiceToggle(service.id)}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`service-${service.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {service.name}
                    </label>
                  </div>
                  {selectedService && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={service.minHours || 1}
                        max={service.maxHours || 100}
                        step={0.5}
                        value={selectedService.hours}
                        onChange={(e) => handleHoursChange(service.id, parseFloat(e.target.value) || 1)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-zinc-500">hours</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && !error && services.length === 0 && (
        <p className="text-zinc-500">No services available.</p>
      )}

      {servicesError && (
        <p className="text-sm text-red-600 mt-2">{servicesError}</p>
      )}
    </div>
  )
}
