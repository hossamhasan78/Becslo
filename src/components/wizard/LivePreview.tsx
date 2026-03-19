'use client'

import { usePricing } from '@/components/context/PricingContext'
import { formatCurrency } from '@/lib/utils/formatting'
import { memo } from 'react'
import type { PricingOutput, ServiceBreakdown } from '@/lib/types/pricing'

function PriceDisplay({ result }: { result: PricingOutput }) {
  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-zinc-600 mb-1">Final Price</div>
        <div className="text-3xl font-bold text-blue-600">{formatCurrency(result.finalPrice)}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
          <div className="text-sm text-zinc-600 mb-1">Recommended Range</div>
          <div className="flex gap-2">
            <div>
              <div className="text-xs text-zinc-500">Min</div>
              <div className="font-semibold">{formatCurrency(result.recommendedMin)}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Max</div>
              <div className="font-semibold">{formatCurrency(result.recommendedMax)}</div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
          <div className="text-sm text-zinc-600 mb-1">Base Cost</div>
          <div className="font-semibold">{formatCurrency(result.baseCost)}</div>
        </div>
      </div>
    </>
  )
}

function CostBreakdown({ result }: { result: PricingOutput }) {
  const riskPercent = result.subtotal > 0 ? ((result.riskBufferAmount / result.subtotal) * 100).toFixed(1) : '0'
  const profitPercent = (result.subtotal + result.riskBufferAmount) > 0 ? ((result.profitMarginAmount / (result.subtotal + result.riskBufferAmount)) * 100).toFixed(1) : '0'

  return (
    <div>
      <h4 className="font-semibold mb-2">Cost Breakdown</h4>
      <div className="space-y-2">
        <div className="flex justify-between py-2 border-b">
          <span>Base Cost</span>
          <span className="font-semibold">{formatCurrency(result.baseCost)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span>Overhead Costs</span>
          <span className="font-semibold">{formatCurrency(result.overheadCosts)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span>Subtotal</span>
          <span className="font-semibold">{formatCurrency(result.subtotal)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span>Risk Buffer ({riskPercent}%)</span>
          <span className="font-semibold">{formatCurrency(result.riskBufferAmount)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>Profit Margin ({profitPercent}%)</span>
          <span className="font-semibold">{formatCurrency(result.profitMarginAmount)}</span>
        </div>
      </div>
    </div>
  )
}

const ServiceBreakdownItem = memo(function ServiceBreakdownItem({ item }: { item: ServiceBreakdown }) {
  return (
    <div className="py-2 border-b">
      <div className="font-medium">{item.serviceName}</div>
      <div className="text-sm text-zinc-600">{item.hours}h × ${item.adjustedRate}/h = {formatCurrency(item.cost)}</div>
    </div>
  )
})

function ServiceBreakdownList({ result }: { result: PricingOutput }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">Service Breakdown</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {result.breakdown.map(item => (
          <ServiceBreakdownItem key={item.serviceId} item={item} />
        ))}
      </div>
    </div>
  )
}

function LivePreview() {
  const { result, pricing, isLoading } = usePricing()

  const servicesSelected = pricing.services.length > 0
  const countriesSelected = pricing.designerCountryCode.length === 2 && pricing.clientCountryCode.length === 2

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Preview</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-zinc-500">Loading pricing data...</div>
        </div>
      </div>
    )
  }

  if (!servicesSelected) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Preview</h3>
        <p className="text-zinc-500 text-sm text-center py-4">
          Select services to see price calculation
        </p>
      </div>
    )
  }

  if (!countriesSelected) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Preview</h3>
        <p className="text-zinc-500 text-sm text-center py-4">
          Select countries to see price calculation
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Preview</h3>
        <p className="text-zinc-500 text-sm text-center py-4">
          Unable to calculate. Please check your selections.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Price Preview</h3>

      <div className="space-y-4">
        <PriceDisplay result={result} />
        <CostBreakdown result={result} />
        <ServiceBreakdownList result={result} />
      </div>
    </div>
  )
}

export default memo(LivePreview)
