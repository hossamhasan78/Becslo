export interface CostEntry {
  costId: number;
  costName: string;
  amount: number;
}

export interface PricingInput {
  pricingModel: 'hourly' | 'project';
  services: Array<{
    serviceId: string;
    hours: number;
  }>;
  designerExperience: number;
  freelanceExperience: number;
  designerCountryCode: string;
  clientCountryCode: string;
  selectedCosts: Array<{ costId: string; costName: string; amount: number }>;
  riskBufferPercent: number;
  profitMarginPercent: number;
}

export interface ServiceBreakdown {
  serviceId: string;
  serviceName: string;
  hours: number;
  baseRate: number;
  experienceMultiplier: number;
  geographyMultiplier: number;
  adjustedRate: number;
  cost: number;
}

export interface CostBreakdown {
  costId: string;
  costName: string;
  amount: number;
}

export interface PricingOutput {
  baseCost: number;
  overheadCosts: number;
  costBreakdown: CostBreakdown[];
  subtotal: number;
  riskBufferAmount: number;
  profitMarginAmount: number;
  finalPrice: number;
  recommendedMin: number;
  recommendedMax: number;
  experienceMultiplier: number;
  geographyMultiplier: number;
  breakdown: ServiceBreakdown[];
}

export interface Service {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  default_hours: number;
  min_hours: number;
  max_hours: number;
  base_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cost {
  id: number;
  name: string;
  is_fixed_amount: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Config {
  id: number;
  base_rate: number;
  risk_buffer_min: number;
  risk_buffer_max: number;
  profit_margin_min: number;
  profit_margin_max: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface CalculateResponse {
  success: true;
  data: PricingOutput;
}
