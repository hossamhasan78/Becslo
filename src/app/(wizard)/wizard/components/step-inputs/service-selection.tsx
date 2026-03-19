'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { useState, useEffect } from 'react'

interface ServiceData {
  id: number
  name: string
  defaultHours: number
  minHours: number
  maxHours: number
}

export function ServiceSelection() {
  const { state, addService, removeService, updateServiceHours } = useWizard()
  const { setPricing } = usePricing()
  const [services, setServices] = useState<ServiceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/v1/services')

        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.statusText}`)
        }

        const data = await response.json()
        setServices(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch services:', error)
        setError('Unable to load services. Please try again.')
        setServices([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [])

  useEffect(() => {
    setPricing({
      services: state.services.map(s => ({
        serviceId: String(s.id),
        hours: s.hours
      }))
    })
  }, [state.services, setPricing])

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
    updateServiceHours(serviceId, hours)
  }

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
            onClick={() => window.location.reload()}
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
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
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
                    <p className="text-sm text-zinc-500 mt-1">
                      Default: {service.defaultHours || 1} hours
                    </p>
                  </div>
                  {selectedService && (
                    <input
                      type="number"
                      min={service.minHours || 1}
                      max={service.maxHours || 100}
                      step={0.5}
                      value={selectedService.hours}
                      onChange={(e) => handleHoursChange(service.id, parseFloat(e.target.value) || 1)}
                      className="w-24 px-2 py-1 border rounded"
                    />
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
    </div>
  )
}
