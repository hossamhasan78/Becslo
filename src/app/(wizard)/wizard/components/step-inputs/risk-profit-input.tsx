'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { usePricing } from '@/components/context/PricingContext'
import { useEffect } from 'react'

export function RiskProfitInput() {
  const { state, setRiskBuffer, setProfitMargin } = useWizard()
  const { setPricing } = usePricing()

  useEffect(() => {
    setPricing({
      riskBufferPercent: state.riskBuffer,
      profitMarginPercent: state.profitMargin
    })
  }, [state.riskBuffer, state.profitMargin, setPricing])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Risk Buffer & Profit Margin</h3>
      
      <div>
        <label htmlFor="riskBuffer" className="block text-sm font-medium text-gray-700 mb-2">
          Risk Buffer: <span className="text-zinc-500 ml-1">{state.riskBuffer}%</span>
        </label>
        <input
          id="riskBuffer"
          type="range"
          min="0"
          max="50"
          step="1"
          value={state.riskBuffer}
          onChange={(e) => setRiskBuffer(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label htmlFor="profitMargin" className="block text-sm font-medium text-gray-700 mb-2">
          Profit Margin: <span className="text-zinc-500 ml-1">{state.profitMargin}%</span>
        </label>
        <input
          id="profitMargin"
          type="range"
          min="10"
          max="50"
          step="1"
          value={state.profitMargin}
          onChange={(e) => setProfitMargin(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
