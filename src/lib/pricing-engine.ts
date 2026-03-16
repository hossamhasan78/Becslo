import { ExperienceMultipliers, GeoMultipliers } from '@/types/database'

export function getDesignerMultiplier(
  years: number,
  multipliers: ExperienceMultipliers['designer']
): number {
  if (years <= 2) return multipliers['0-2'] || 0.7
  if (years <= 5) return multipliers['3-5'] || 1.0
  if (years <= 9) return multipliers['6-9'] || 1.3
  return multipliers['10+'] || 1.6
}

export function getFreelanceMultiplier(
  years: number,
  multipliers: ExperienceMultipliers['freelance']
): number {
  if (years <= 1) return multipliers['0-1'] || 0.8
  if (years <= 3) return multipliers['2-3'] || 1.0
  if (years <= 6) return multipliers['4-6'] || 1.2
  return multipliers['7+'] || 1.4
}

export function getGeoMultiplier(
  countryCode: string,
  multipliers: GeoMultipliers
): number {
  return multipliers[countryCode] || 1.0
}

export interface ServiceInput {
  serviceId: string
  hours: number
}

export interface CostInput {
  name: string
  amount: number
  type: 'monthly' | 'project'
}

export interface CalculationInput {
  experienceYears: number
  freelanceYears: number
  designerCountry: string
  clientCountry: string
  pricingModel: 'hourly' | 'project'
  riskLevel: 'low' | 'normal' | 'high'
  profitMargin: number
  services: ServiceInput[]
  costs: CostInput[]
}

export interface CalculationResult {
  totalHours: number
  baseRate: number
  experienceMultiplier: number
  geoMultiplier: number
  adjustedHourlyRate: number
  baseCost: number
  overhead: number
  riskBuffer: number
  profitMargin: number
  finalPrice: number
}

export function calculatePrice(
  input: CalculationInput,
  config: {
    baseHourlyRate: number
    experienceMultipliers: ExperienceMultipliers
    geoMultipliers: GeoMultipliers
    riskBuffer: number
  }
): CalculationResult {
  const { experienceYears, freelanceYears, designerCountry, clientCountry, services, costs, riskLevel, profitMargin } = input
  const { baseHourlyRate, experienceMultipliers, geoMultipliers, riskBuffer } = config

  const totalHours = services.reduce((sum, s) => sum + s.hours, 0)

  const designerExpMultiplier = getDesignerMultiplier(experienceYears, experienceMultipliers.designer)
  const freelanceExpMultiplier = getFreelanceMultiplier(freelanceYears, experienceMultipliers.freelance)
  const experienceMultiplier = designerExpMultiplier * freelanceExpMultiplier

  const geoMultiplier = getGeoMultiplier(designerCountry, geoMultipliers)

  const adjustedHourlyRate = baseHourlyRate * experienceMultiplier * geoMultiplier

  const baseCost = totalHours * adjustedHourlyRate

  const overhead = costs.reduce((sum, cost) => {
    if (cost.type === 'project') {
      return sum + cost.amount
    }
    return sum + cost.amount
  }, 0)

  const riskMultiplier = {
    low: 0.5,
    normal: 1.0,
    high: 1.5
  }
  const riskBufferAmount = baseCost * (riskBuffer / 100) * riskMultiplier[riskLevel]

  const profitMarginAmount = (baseCost + overhead + riskBufferAmount) * (profitMargin / 100)

  const finalPrice = Math.round(baseCost + overhead + riskBufferAmount + profitMarginAmount)

  return {
    totalHours,
    baseRate: baseHourlyRate,
    experienceMultiplier,
    geoMultiplier,
    adjustedHourlyRate,
    baseCost,
    overhead,
    riskBuffer: riskBufferAmount,
    profitMargin: profitMarginAmount,
    finalPrice
  }
}
