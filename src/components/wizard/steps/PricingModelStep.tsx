'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { PricingModel } from '@/types/wizard'

export function PricingModelStep() {
  const { state, setPricingModel } = useWizard()

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-zinc-800">Choose Pricing Model</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label 
          className={`
            flex flex-col gap-2 p-6 border-2 rounded-2xl cursor-pointer transition-all
            ${state.pricingModel === 'hourly' 
              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20' 
              : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'}
          `}
          onClick={() => setPricingModel('hourly')}
        >
          <input
            type="radio"
            name="pricingModel"
            checked={state.pricingModel === 'hourly'}
            onChange={() => setPricingModel('hourly')}
            className="sr-only"
          />
          <div className="font-bold text-lg text-zinc-900">Hourly Rate</div>
          <div className="text-sm text-zinc-500 leading-relaxed">
            Calculate your total fees based on estimated hours per service. 
            Best for individual contributors and smaller scopes.
          </div>
          {state.pricingModel === 'hourly' && (
            <div className="mt-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
              Currently Selected
            </div>
          )}
        </label>

        <label 
          className={`
            flex flex-col gap-2 p-6 border-2 rounded-2xl cursor-pointer transition-all
            ${state.pricingModel === 'project' 
              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20' 
              : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'}
          `}
          onClick={() => setPricingModel('project')}
        >
          <input
            type="radio"
            name="pricingModel"
            checked={state.pricingModel === 'project'}
            onChange={() => setPricingModel('project')}
            className="sr-only"
          />
          <div className="font-bold text-lg text-zinc-900">Project-Based</div>
          <div className="text-sm text-zinc-500 leading-relaxed">
            Fixed lump-sum price for the whole project. 
            Standard for agencies and larger project deliverables.
          </div>
          {state.pricingModel === 'project' && (
            <div className="mt-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
              Currently Selected
            </div>
          )}
        </label>
      </div>
    </div>
  )
}
