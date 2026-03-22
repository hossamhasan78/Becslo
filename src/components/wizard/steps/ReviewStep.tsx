'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState } from 'react'

export function ReviewStep() {
  const { state, result, validateCurrentStep, calculateAndSave, isLoading } = useWizard()
  const [saveMessage, setSaveMessage] = useState('')

  const handleCalculateSave = async () => {
    setSaveMessage('')
    try {
      await calculateAndSave()
      setSaveMessage('Success! Your calculation has been persisted.')
    } catch (error) {
      setSaveMessage(error.message || 'Save failed. Please try again.')
    }
  }

  const validation = validateCurrentStep()
  const canFinalize = validation.isValid

  if (!result) {
    return (
      <div className="py-20 text-center animate-in fade-in duration-500">
        <h3 className="text-xl font-bold text-zinc-900">Calculating your project price...</h3>
        <p className="text-zinc-500 mt-2">Please ensure all previous steps are completed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-zinc-900">Project Review</h3>
        <p className="text-sm text-zinc-500">Everything looks solid. Review the final details below.</p>
      </div>

      <div className="bg-zinc-50 rounded-3xl border border-zinc-100 overflow-hidden shadow-inner p-8 space-y-8">
        {/* Services Summary */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Selected Services</label>
          <div className="space-y-2">
            {result.breakdown.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-200 last:border-0">
                <span className="text-sm font-bold text-zinc-700">{item.serviceName}</span>
                <span className="text-sm font-black text-zinc-900">${Math.round(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Multipliers Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Experience</span>
            <span className="text-lg font-black text-blue-600">×{result.experienceMultiplier.toFixed(2)}</span>
          </div>
          <div className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Geography</span>
            <span className="text-lg font-black text-blue-600">×{result.geographyMultiplier.toFixed(2)}</span>
          </div>
        </div>

        {/* Final Price Block */}
        <div className="pt-6 border-t border-zinc-200">
          <div className="flex justify-between items-end mb-4">
            <label className="text-sm font-black text-zinc-400 uppercase tracking-widest">Total Valuation</label>
            <div className="text-5xl font-black text-zinc-900">${Math.round(result.finalPrice)}</div>
          </div>
          <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Recommended Range</span>
            </div>
            <div className="text-xl font-black flex items-center gap-2">
              <span>${Math.round(result.recommendedMin)}</span>
              <span className="text-zinc-500 text-sm">to</span>
              <span>${Math.round(result.recommendedMax)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleCalculateSave}
          disabled={isLoading || !canFinalize || state.isSaved}
          className={`
            w-full py-5 rounded-2xl text-white font-black text-lg transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]
            ${(isLoading || state.isSaved) ? 'bg-zinc-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {isLoading ? 'Persisting Quote...' : state.isSaved ? 'Quote Saved' : 'Calculate & Save'}
        </button>

        <button
          disabled
          className="w-full py-4 bg-white border-2 border-zinc-100 text-zinc-300 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Download PDF (Coming Soon)</span>
        </button>

        {state.isSaved && (
          <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-3xl flex items-center justify-between text-white animate-in zoom-in-95 duration-500">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase opacity-40 tracking-[0.2em] text-zinc-300">Reference ID</span>
              <span className="text-xs font-black font-mono text-zinc-100">{state.savedCalculationId}</span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 rounded-full px-4 py-2 flex items-center gap-2 border border-emerald-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest">Persisted</span>
            </div>
          </div>
        )}

        {saveMessage && !state.isSaved && (
          <div className="p-4 rounded-2xl text-center font-bold animate-in zoom-in-95 duration-200 bg-red-50 text-red-700 border border-red-100">
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  )
}
