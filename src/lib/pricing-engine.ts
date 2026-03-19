import type { PricingInput, PricingOutput, ServiceBreakdown } from './types/pricing';
import { roundToNearestDollar } from './utils/formatting';

interface CountryMultiplier {
  code: string;
  multiplier: number;
}

interface CostItem {
  id: string;
  isFixedAmount: boolean;
  defaultCost: number;
}

interface ServiceItem {
  id: string;
  name: string;
  baseRate: number;
}

export function calculatePrice(
  input: PricingInput,
  countries: CountryMultiplier[],
  costs: CostItem[],
  services: ServiceItem[]
): PricingOutput {
  const breakdown: ServiceBreakdown[] = []
  let baseCost = 0

  const experienceMultiplier = input.designerExperience * input.freelanceExperience

  let designerMultiplier = 1
  let clientMultiplier = 1
  for (let i = 0; i < countries.length; i++) {
    const c = countries[i]
    if (c.code === input.designerCountryCode) designerMultiplier = c.multiplier
    if (c.code === input.clientCountryCode) clientMultiplier = c.multiplier
  }
  const geographyMultiplier = designerMultiplier * clientMultiplier

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

  let overheadCosts = 0
  const costCount = input.selectedCosts.length
  for (let i = 0; i < costCount; i++) {
    const costId = input.selectedCosts[i]
    for (let j = 0; j < costs.length; j++) {
      if (costs[j].id === costId) {
        overheadCosts += costs[j].defaultCost
        break
      }
    }
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
