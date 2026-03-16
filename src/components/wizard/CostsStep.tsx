'use client'

import { useWizard } from '@/components/WizardContext'
import { validateHours } from '@/lib/validation'
import { useEffect } from 'react'
import type { CostInput } from '@/lib/pricing-engine'

const COST_CATEGORIES = [
  { key: 'software', label: 'Software', example: 'Figma, Adobe CC, Notion' },
  { key: 'subscriptions', label: 'Subscriptions', example: 'Cloud storage, prototyping tools' },
  { key: 'tools', label: 'Tools', example: 'Tablets, stylus, monitor' },
  { key: 'outsourcing', label: 'Outsourcing', example: 'Contractors, copywriters' },
  { key: 'travel', label: 'Travel', example: 'Client meetings, workshops' },
  { key: 'research', label: 'Research Incentives', example: 'Payments to test participants' },
  { key: 'misc', label: 'Misc/Other', example: 'Stock assets, external API fees' },
]

export function CostsStep() {
  const { input, updateInput, setError, clearError, errors } = useWizard()

  const costs = input.costs || []

  useEffect(() => {
    if (costs.length > 0) {
      clearError('costs')
    }
  }, [costs, clearError])

  const addCost = (category: string) => {
    const newCost: CostInput = {
      name: '',
      amount: 0,
      type: 'monthly',
    }
    updateInput({ costs: [...costs, newCost] })
  }

  const updateCost = (index: number, field: keyof CostInput, value: string | number) => {
    const updated = costs.map((cost, i) => {
      if (i === index) {
        return { ...cost, [field]: value }
      }
      return cost
    })
    updateInput({ costs: updated })
    
    if (field === 'amount' && typeof value === 'number') {
      const validation = validateHours(value)
      if (!validation.isValid) {
        setError(`cost_${index}`, validation.error || 'Invalid amount')
      } else {
        clearError(`cost_${index}`)
      }
    }
  }

  const removeCost = (index: number) => {
    const updated = costs.filter((_, i) => i !== index)
    updateInput({ costs: updated })
  }

  const getCostsByCategory = (category: string) => {
    return costs.filter((_, i) => i.toString().startsWith(category))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Project Costs</h2>
      <p className="text-gray-500 text-sm">Add any additional costs associated with this project.</p>
      {errors.costs && (
        <p className="text-red-500 text-sm">{errors.costs}</p>
      )}

      {COST_CATEGORIES.map(({ key, label, example }) => (
        <div key={key} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-xs text-gray-500">{example}</div>
            </div>
            <button
              type="button"
              onClick={() => addCost(key)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add
            </button>
          </div>
          {getCostsByCategory(key).length > 0 && (
            <div className="p-4 space-y-2">
              {costs.map((cost, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Cost name"
                    value={cost.name}
                    onChange={(e) => updateCost(index, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={cost.amount}
                    onChange={(e) => updateCost(index, 'amount', Number(e.target.value))}
                    className={`w-24 px-2 py-1 border rounded ${errors[`cost_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <select
                    value={cost.type}
                    onChange={(e) => updateCost(index, 'type', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="project">Project</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCost(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                  {errors[`cost_${index}`] && (
                    <span className="text-red-500 text-xs">{errors[`cost_${index}`]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
