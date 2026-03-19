'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState } from 'react'

export function ReviewStep() {
  const { state, result, validateCurrentStep } = useWizard()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleCalculateSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/v1/calculate-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricingModel: state.pricingModel || 'hourly',
          services: state.services.map(s => ({ serviceId: String(s.id), hours: s.hours })),
          designerExperience: state.experienceDesigner,
          freelanceExperience: state.experienceFreelance,
          designerCountryCode: state.designerCountryCode,
          clientCountryCode: state.clientCountryCode,
          selectedCosts: state.costs.map(String),
          riskBufferPercent: state.riskBuffer,
          profitMarginPercent: state.profitMargin
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSaveMessage('Calculation saved successfully!')
      } else {
        setSaveMessage(data.error?.message || 'Save failed. Please try again.')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
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
          disabled={isSaving || !canFinalize}
          className={`
            w-full py-5 rounded-2xl text-white font-black text-lg transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]
            ${isSaving ? 'bg-zinc-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {isSaving ? 'Persisting Quote...' : 'Calculate & Save'}
        </button>

        <button
          disabled
          className="w-full py-4 bg-white border-2 border-zinc-100 text-zinc-300 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Download PDF (Coming Soon)</span>
        </button>

        {saveMessage && (
          <div className={`p-4 rounded-xl text-center font-bold animate-in zoom-in-95 duration-200 ${
            saveMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  )
}
