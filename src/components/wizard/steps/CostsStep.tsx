'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { StepSkeleton } from '../Skeleton'

export function CostsStep() {
  const { state, setCostAmount, allCosts, isLoading } = useWizard()

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
          allCosts.map((cost) => {
            const currentValue = state.costs.find(c => c.costId === cost.id)?.amount || 0

            return (
              <div
                key={cost.id}
                className="flex items-center gap-4 p-5 border-2 border-zinc-100 rounded-2xl hover:border-zinc-200 hover:bg-zinc-50 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-zinc-900">{cost.name}</div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    step={1}
                    value={currentValue || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      setCostAmount(cost.id, cost.name, value)
                    }}
                    placeholder="0"
                    className="pl-7 pr-4 py-2 w-32 text-right border-2 border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-black"
                  />
                </div>
              </div>
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
