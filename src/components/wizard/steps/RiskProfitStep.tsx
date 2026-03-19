'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { useState, useEffect } from 'react'

interface Config {
  risk_buffer_min: number
  risk_buffer_max: number
  profit_margin_min: number
  profit_margin_max: number
}

export function RiskProfitStep() {
  const { state, setRiskBuffer, setProfitMargin, config } = useWizard()

  // Use values from context config, or fallback to spec defaults
  const riskMin = config?.risk_buffer_min ?? 0
  const riskMax = config?.risk_buffer_max ?? 50
  const profitMin = config?.profit_margin_min ?? 10
  const profitMax = config?.profit_margin_max ?? 50

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-zinc-900">Risk & Profit</h3>
        <p className="text-sm text-zinc-500">Adjust your buffers and margins to finalize the price.</p>
      </div>

      <div className="space-y-10">
        {/* Risk Buffer */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
              Risk Buffer
            </label>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-600">{state.riskBuffer}</span>
              <span className="text-sm font-bold text-zinc-400">%</span>
            </div>
          </div>
          
          <div className="relative pt-2">
            <input
              type="range"
              min={riskMin}
              max={riskMax}
              step="1"
              value={state.riskBuffer}
              onChange={(e) => setRiskBuffer(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-zinc-400">{riskMin}%</span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                {state.riskBuffer <= 10 ? 'Low Risk' : state.riskBuffer <= 25 ? 'Standard' : 'High Risk'}
              </span>
              <span className="text-xs font-medium text-zinc-400">{riskMax}%</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            Covers scope creep, unexpected revisions, and project delays.
          </p>
        </div>

        {/* Profit Margin */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
              Profit Margin
            </label>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-600">{state.profitMargin}</span>
              <span className="text-sm font-bold text-zinc-400">%</span>
            </div>
          </div>
          
          <div className="relative pt-2">
            <input
              type="range"
              min={profitMin}
              max={profitMax}
              step="1"
              value={state.profitMargin}
              onChange={(e) => setProfitMargin(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-zinc-400">{profitMin}%</span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                {state.profitMargin <= 15 ? 'Competitive' : state.profitMargin <= 30 ? 'Moderate' : 'Premium'}
              </span>
              <span className="text-xs font-medium text-zinc-400">{profitMax}%</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            Your net profit after all technical rates and overhead costs are covered.
          </p>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mt-6 flex gap-3">
        <div className="text-blue-600 font-bold text-xl">💡</div>
        <p className="text-xs text-zinc-500 leading-relaxed py-1">
          Higher margins are recommended for specialized experts, while lower margins can help win competitive bids if you're just starting out.
        </p>
      </div>
    </div>
  )
}
