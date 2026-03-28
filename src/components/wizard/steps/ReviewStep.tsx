'use client'

import { useWizard } from '@/lib/context/WizardContext'

export function ReviewStep() {
  const { result, updateState } = useWizard()

  const goBackToStep1 = () => {
    updateState({ currentStep: 1 })
  }

  if (!result) {
    return (
      <div className="py-20 text-center animate-in fade-in duration-500">
        <h3 className="text-xl font-bold text-zinc-900">Calculating your project price...</h3>
        <p className="text-zinc-500 mt-2">Please ensure all previous steps are completed.</p>
      </div>
    )
  }

  const experienceMultiplierDisplay = result.experienceMultiplier.toFixed(2)
  const geographyMultiplierDisplay = result.geographyMultiplier.toFixed(2)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-zinc-900">Your Project Quote</h3>
        <p className="text-sm text-zinc-500">Complete breakdown of your calculated price.</p>
      </div>

      {result.breakdown.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Selected Services</label>
            <div className="space-y-2">
              {result.breakdown.map((item) => (
                <div key={item.serviceId} className="flex justify-between items-center py-3 border-b border-zinc-100 last:border-0">
                  <span className="text-sm font-bold text-zinc-800">{item.serviceName}</span>
                  <span className="text-sm text-zinc-500">{item.hours}h</span>
                  <span className="text-sm font-bold text-zinc-900">${Math.round(item.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="w-12 h-12 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0-6m0 6m6-0h6m-6 0-6m6 0h6m0 6l9 9" />
            </svg>
            <div className="text-center">
              <h4 className="text-sm font-medium text-zinc-700">No services selected</h4>
              <button
                onClick={goBackToStep1}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all"
              >
                ← Go back to select services
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-4">Experience Multiplier</div>
          <div className="text-center">
            <div className="text-5xl font-black text-zinc-900">
              ×{experienceMultiplierDisplay}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-4">Geography Multiplier</div>
          <div className="text-center">
            <div className="text-5xl font-black text-zinc-900">
              ×{geographyMultiplierDisplay}
            </div>
          </div>
        </div>
      </div>

      {result.costBreakdown.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Overhead Costs</label>
            <div className="space-y-2">
              {result.costBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-100 last:border-0">
                  <span className="text-sm font-bold text-zinc-800">{item.costName}</span>
                  <span className="text-sm font-bold text-zinc-900">${Math.round(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
          <div className="text-center">
            <svg className="w-12 h-12 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0-6m0 6m6-0h6m-6 0-6m6 0h6m0 6l9 9" />
            </svg>
            <div className="text-center">
              <h4 className="text-sm font-medium text-zinc-700">No overhead costs entered</h4>
              <p className="text-xs text-zinc-500 mt-2">Leave this step empty if no additional business expenses apply</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Pricing Summary</label>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500 font-medium">Services Subtotal</span>
              <span className="text-lg font-bold text-zinc-900">${Math.round(result.baseCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500 font-medium">Overhead Costs</span>
              <span className="text-lg font-bold text-zinc-900">${Math.round(result.overheadCosts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500 font-medium">Subtotal</span>
              <span className="text-lg font-bold text-zinc-900">${Math.round(result.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500 font-medium">Risk Buffer</span>
              <span className="text-lg font-bold text-zinc-900">${Math.round(result.riskBufferAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500 font-medium">Profit Margin</span>
              <span className="text-lg font-bold text-zinc-900">${Math.round(result.profitMarginAmount)}</span>
            </div>
            <div className="pt-4 border-t border-zinc-200 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-zinc-900">Final Price</span>
                <span className="text-3xl font-black text-blue-600">${Math.round(result.finalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-xl p-8 text-white">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Recommended Range</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold">$</div>
              <div className="text-3xl font-black">{Math.round(result.recommendedMin)}</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">$</div>
              <div className="text-3xl font-black">{Math.round(result.recommendedMax)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
