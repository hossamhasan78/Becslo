'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { useState, useEffect } from 'react'

interface CostData {
  id: number
  name: string
  is_fixed_amount: boolean
  default_cost: number
}

export function CostSelection() {
  const { state, toggleCost } = useWizard()
  const { setPricing } = usePricing()
  const [costs, setCosts] = useState<CostData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCosts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/v1/costs')

        if (!response.ok) {
          throw new Error(`Failed to fetch costs: ${response.statusText}`)
        }

        const data = await response.json()
        setCosts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch costs:', error)
        setError('Unable to load costs. Please try again.')
        setCosts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCosts()
  }, [])

  useEffect(() => {
    setPricing({
      selectedCosts: state.costs.map(String)
    })
  }, [state.costs, setPricing])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
        <p className="text-zinc-500">Loading costs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (costs.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
        <p className="text-zinc-500">No additional costs available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
      <div className="space-y-2">
        {costs.map(cost => {
          const isSelected = state.costs.includes(cost.id)

          return (
            <label
              key={cost.id}
              className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleCost(cost.id)}
                className="h-4 w-4"
              />
              <div className="flex-1">
                <div className="font-medium">{cost.name}</div>
                <div className="text-sm text-zinc-500">
                  ${cost.is_fixed_amount ? cost.default_cost.toFixed(2) : `${cost.default_cost}%`}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
