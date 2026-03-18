'use client'

import { useWizard } from '@/lib/context/WizardContext'

export function LivePreview() {
  const { state } = useWizard()

  return (
    <div className="sticky top-8">
      <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 min-h-[300px]">
        <p className="text-zinc-500 text-sm mb-4">
          Your fee calculation will appear here as you complete each step.
        </p>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600">Pricing Model:</span>
            <span className="font-medium">
              {state.pricingModel || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Services:</span>
            <span className="font-medium">
              {state.services.length || 0} selected
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Designer Exp:</span>
            <span className="font-medium">{state.experienceDesigner}/10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Freelance Exp:</span>
            <span className="font-medium">{state.experienceFreelance}/10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Risk Buffer:</span>
            <span className="font-medium">{state.riskBuffer}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Profit Margin:</span>
            <span className="font-medium">{state.profitMargin}%</span>
          </div>
          
          <hr className="my-4" />
          
          <div className="flex justify-between text-base font-bold">
            <span>Estimated Total:</span>
            <span>$0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
