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
  selectedCosts: string[];
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

export interface PricingOutput {
  baseCost: number;
  overheadCosts: number;
  subtotal: number;
  riskBufferAmount: number;
  profitMarginAmount: number;
  finalPrice: number;
  recommendedMin: number;
  recommendedMax: number;
  breakdown: ServiceBreakdown[];
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  defaultHours: number;
  minHours: number;
  maxHours: number;
  baseRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  multiplier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cost {
  id: string;
  name: string;
  isFixedAmount: boolean;
  defaultCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  id: string;
  baseRate: number;
  riskBufferMin: number;
  riskBufferMax: number;
  profitMarginMin: number;
  profitMarginMax: number;
  createdAt: string;
  updatedAt: string;
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
