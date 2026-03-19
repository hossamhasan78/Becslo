'use client'

import { useWizard } from '@/lib/context/WizardContext'
import { formatCurrency } from '@/lib/utils/formatting'
import { memo } from 'react'
import type { PricingOutput, ServiceBreakdown } from '@/lib/types/pricing'

function PriceDisplay({ result, pricingModel }: { result: PricingOutput, pricingModel: string }) {
  const isProject = pricingModel === 'project'

  return (
    <div className="space-y-4">
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-blue-100 text-sm font-medium mb-1">
          Estimated {isProject ? 'Project Fee' : 'Total Price'}
        </div>
        <div className="text-4xl font-bold tracking-tight">
          {formatCurrency(result.finalPrice)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Recommended Range</div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-zinc-800">{formatCurrency(result.recommendedMin)}</div>
            <div className="h-px w-4 bg-zinc-300 mx-2"></div>
            <div className="text-lg font-bold text-zinc-800">{formatCurrency(result.recommendedMax)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CostBreakdownItem({ label, value, subtext }: { label: string, value: string, subtext?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-zinc-700">{label}</div>
        {subtext && <div className="text-xs text-zinc-500">{subtext}</div>}
      </div>
      <div className="text-sm font-bold text-zinc-900">{value}</div>
    </div>
  )
}

function CostBreakdown({ result }: { result: PricingOutput }) {
  const riskPercent = result.subtotal > 0 ? ((result.riskBufferAmount / result.subtotal) * 100).toFixed(0) : '0'
  const profitPercent = (result.subtotal + result.riskBufferAmount) > 0 ? ((result.profitMarginAmount / (result.subtotal + result.riskBufferAmount)) * 100).toFixed(0) : '0'

  return (
    <div className="mt-8">
      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Cost Breakdown</h4>
      <div className="bg-white rounded-xl border border-zinc-100 px-4">
        <CostBreakdownItem label="Services Subtotal" value={formatCurrency(result.baseCost)} />
        <CostBreakdownItem label="Overhead Costs" value={formatCurrency(result.overheadCosts)} />
        <CostBreakdownItem label="Risk Buffer" value={formatCurrency(result.riskBufferAmount)} subtext={`${riskPercent}% buffer`} />
        <CostBreakdownItem label="Profit Margin" value={formatCurrency(result.profitMarginAmount)} subtext={`${profitPercent}% margin`} />
      </div>
    </div>
  )
}

const ServiceBreakdownItem = memo(function ServiceBreakdownItem({ item }: { item: ServiceBreakdown }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0 group">
      <div>
        <div className="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors">{item.serviceName}</div>
        <div className="text-xs text-zinc-500">{item.hours}h × {formatCurrency(item.adjustedRate)}/h</div>
      </div>
      <div className="text-sm font-bold text-zinc-900">{formatCurrency(item.cost)}</div>
    </div>
  )
})

function ServiceBreakdownList({ result }: { result: PricingOutput }) {
  return (
    <div className="mt-8">
      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Service Details</h4>
      <div className="bg-white rounded-xl border border-zinc-100 px-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {result.breakdown.map(item => (
          <ServiceBreakdownItem key={item.serviceId} item={item} />
        ))}
      </div>
    </div>
  )
}

function ProjectBreakdown({ result }: { result: PricingOutput }) {
  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Project Summary</h4>
      <div className="bg-white rounded-xl border border-zinc-100 p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 font-medium">Included Services</span>
          <span className="font-bold text-zinc-900">{result.breakdown.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 font-medium">Total Resource Hours</span>
          <span className="font-bold text-zinc-900">
            {result.breakdown.reduce((sum, item) => sum + item.hours, 0)}h
          </span>
        </div>
        <div className="pt-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            This lump-sum estimate includes all labor, overhead costs, and risk buffers as a single fixed fee.
          </p>
        </div>
      </div>
    </div>
  )
}

function LivePreview() {
  const { result, state, isLoading, error } = useWizard()
  const { pricingModel, services, designerCountryCode, clientCountryCode } = state

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-zinc-200 rounded-2xl"></div>
        <div className="h-24 bg-zinc-200 rounded-2xl"></div>
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
          <div className="h-20 bg-zinc-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <div className="text-red-600 font-bold mb-2">Error</div>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  const hasData = services.length > 0 && designerCountryCode && clientCountryCode

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="bg-zinc-100 rounded-full p-4 mb-4 text-zinc-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-zinc-800 font-bold mb-1">Waiting for details</h3>
        <p className="text-zinc-500 text-sm">Provide details in the wizard to see the live calculation.</p>
      </div>
    )
  }

  if (!result) return null

  const isProject = pricingModel === 'project'

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <PriceDisplay result={result} pricingModel={pricingModel || 'hourly'} />
      <CostBreakdown result={result} />
      {isProject ? (
        <ProjectBreakdown result={result} />
      ) : (
        <ServiceBreakdownList result={result} />
      )}
    </div>
  )
}

export default memo(LivePreview)
