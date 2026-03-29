import type { PricingInput, PricingOutput, ServiceBreakdown, CostBreakdown } from './types/pricing';
import { roundToNearestDollar } from './utils/formatting';

interface CountryMultiplier {
  code: string;
  multiplier: number;
}

interface ServiceItem {
  id: string;
  name: string;
  baseRate: number;
}

export function calculatePrice(
  input: PricingInput,
  countries: CountryMultiplier[],
  services: ServiceItem[]
): PricingOutput {
  const breakdown: ServiceBreakdown[] = []
  let baseCost = 0

  // Experience multiplier: additive percentage-based (15% per year)
  // 1 year = 1.15x, 10 years = 2.50x, 25 years = 4.00x
  const experienceMultiplier = 1 + (input.designerExperience * 0.15) + (input.freelanceExperience * 0.15)

  let designerMultiplier = 1
  let clientMultiplier = 1
  for (let i = 0; i < countries.length; i++) {
    const c = countries[i]
    if (c.code === input.designerCountryCode) designerMultiplier = c.multiplier
    if (c.code === input.clientCountryCode) clientMultiplier = c.multiplier
  }
  // If designer and client are in the same country, no geographic cost adjustment (multiplier = 1)
  const geographyMultiplier = input.designerCountryCode === input.clientCountryCode
    ? 1
    : designerMultiplier * clientMultiplier

  const serviceCount = input.services.length
  for (let i = 0; i < serviceCount; i++) {
    const serviceInput = input.services[i]

    let service: ServiceItem | undefined
    for (let j = 0; j < services.length; j++) {
      if (services[j].id === serviceInput.serviceId) {
        service = services[j]
        break
      }
    }
    if (!service) continue

    const adjustedRate = service.baseRate * experienceMultiplier * geographyMultiplier
    const cost = serviceInput.hours * adjustedRate

    breakdown.push({
      serviceId: serviceInput.serviceId,
      serviceName: service.name,
      hours: serviceInput.hours,
      baseRate: service.baseRate,
      experienceMultiplier,
      geographyMultiplier,
      adjustedRate: roundToNearestDollar(adjustedRate),
      cost: roundToNearestDollar(cost)
    })

    baseCost += cost
  }

  baseCost = roundToNearestDollar(baseCost)

  const costBreakdown: CostBreakdown[] = []
  let overheadCosts = 0
  for (const entry of input.selectedCosts) {
    overheadCosts += entry.amount
    costBreakdown.push({ costId: entry.costId, costName: entry.costName, amount: entry.amount })
  }
  overheadCosts = roundToNearestDollar(overheadCosts)

  const subtotal = baseCost + overheadCosts

  const riskBufferAmount = roundToNearestDollar(subtotal * (input.riskBufferPercent / 100))
  const profitMarginAmount = roundToNearestDollar((subtotal + riskBufferAmount) * (input.profitMarginPercent / 100))

  const finalPrice = subtotal + riskBufferAmount + profitMarginAmount

  const recommendedMin = roundToNearestDollar(finalPrice * 0.8)
  const recommendedMax = roundToNearestDollar(finalPrice * 1.2)

  return {
    baseCost,
    overheadCosts,
    costBreakdown,
    subtotal,
    riskBufferAmount,
    profitMarginAmount,
    finalPrice,
    recommendedMin,
    recommendedMax,
    experienceMultiplier,
    geographyMultiplier,
    breakdown
  }
}
