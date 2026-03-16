export type PricingModel = 'hourly' | 'project'
export type RiskLevel = 'low' | 'normal' | 'high'

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
}

export interface Service {
  id: string
  name: string
  category: string
  default_hours: number
  min_hours: number
  max_hours: number
  is_active: boolean
}

export interface Calculation {
  id: string
  user_id: string
  experience_years: number
  freelance_years: number
  designer_country: string
  client_country: string
  pricing_model: PricingModel
  risk_level: RiskLevel
  profit_margin: number
  total_hours: number
  final_price: number
  created_at: string
}

export interface CalculationService {
  id: string
  calculation_id: string
  service_id: string
  hours: number
}

export interface Cost {
  id: string
  calculation_id: string
  name: string
  amount: number
  type: 'monthly' | 'project'
}

export interface Config {
  key: string
  value: Record<string, unknown>
}

export interface ExperienceMultipliers {
  designer: Record<string, number>
  freelance: Record<string, number>
}

export interface GeoMultipliers {
  [countryCode: string]: number
}

export interface ConfigValues {
  base_hourly_rate: number
  experience_multipliers: ExperienceMultipliers
  geo_multipliers: GeoMultipliers
  risk_buffer: number
  profit_margin: number
}
