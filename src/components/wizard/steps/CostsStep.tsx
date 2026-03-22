'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState } from 'react'
import { StepSkeleton } from '../Skeleton'

interface Cost {
  id: number
  name: string
  is_fixed_amount: boolean
  default_cost: number
}

export function CostsStep() {
  const { state, toggleCost, allCosts, isLoading } = useWizard()

  if (isLoading) {
    return <StepSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-zinc-900">Overhead Costs</h3>
        <p className="text-sm text-zinc-500">Add any additional fixed or variable business expenses.</p>
      </div>

      <div className="space-y-3">
        {allCosts.length > 0 ? (
          allCosts.map((cost: Cost) => {
            const isSelected = state.costs.includes(cost.id)
            
            return (
              <label
                key={cost.id}
                className={`
                  flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500/50
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20' 
                    : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'}
                `}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    toggleCost(cost.id)
                  }
                }}
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCost(cost.id)}
                    className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-zinc-900">{cost.name}</div>
                    <div className="text-xs text-zinc-500 italic">
                      {cost.is_fixed_amount ? 'Fixed cost added to project' : 'Percentage based multiplier'}
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-xl text-sm font-black ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {cost.is_fixed_amount ? `$${cost.default_cost}` : `${cost.default_cost}%`}
                </div>
              </label>
            )
          })
        ) : (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-100">
            <p className="text-sm text-zinc-400">No additional costs found.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mt-6">
        <p className="text-xs text-zinc-500 italic leading-relaxed text-center">
          Costs are optional. You can skip this step if no additional overhead applies.
        </p>
      </div>
    </div>
  )
}
