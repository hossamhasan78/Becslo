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
          Risk Buffer (%) <span className="text-zinc-500 ml-1">[{state.riskBuffer}%]</span>
        </label>
        <input
          id="riskBuffer"
          type="number"
          min="0"
          max="50"
          step="1"
          value={state.riskBuffer}
          onChange={(e) => setRiskBuffer(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-zinc-500 mt-1">Buffer for unexpected costs (0-50%)</p>
      </div>

      <div>
        <label htmlFor="profitMargin" className="block text-sm font-medium text-gray-700 mb-2">
          Profit Margin (%) <span className="text-zinc-500 ml-1">[{state.profitMargin}%]</span>
        </label>
        <input
          id="profitMargin"
          type="number"
          min="10"
          max="50"
          step="1"
          value={state.profitMargin}
          onChange={(e) => setProfitMargin(Math.max(10, Math.min(50, parseInt(e.target.value) || 10)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-zinc-500 mt-1">Your profit margin (10-50%)</p>
      </div>
    </div>
  )
}
