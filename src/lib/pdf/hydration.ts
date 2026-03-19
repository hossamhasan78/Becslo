import { PDFQuoteData } from '@/types/pdf';

export interface DBCalculationService {
  hours: number;
  adjusted_rate: number;
  cost: number;
  services: {
    name: string;
  };
}

export interface DBCountry {
  name: string;
  code: string;
  multiplier: number;
}

export interface DBCalculationRecord {
  id: string;
  user_name: string;
  user_email: string;
  pricing_model: string;
  experience_designer: number;
  experience_freelance: number;
  subtotal: number;
  risk_buffer: number;
  profit_margin: number;
  final_price: number;
  created_at: string;
  designer_country?: DBCountry;
  client_country?: DBCountry;
  calculation_services?: DBCalculationService[];
}

export function mapCalculationToPDFData(record: DBCalculationRecord): PDFQuoteData {
  const services = (record.calculation_services || []).map((cs) => ({
    name: cs.services?.name || 'Unknown Service',
    hours: Number(cs.hours),
    rate: Number(cs.adjusted_rate),
    totalCost: Number(cs.cost),
  }));

  const overheadCosts = [];
  if (record.risk_buffer > 0) {
    overheadCosts.push({ name: 'Risk Buffer', value: Number(record.risk_buffer) });
  }
  if (record.profit_margin > 0) {
    overheadCosts.push({ name: 'Profit Margin', value: Number(record.profit_margin) });
  }

  const designerCode = record.designer_country?.code || 'Unknown';
  const clientCode = record.client_country?.code || 'Unknown';

  return {
    calculationId: record.id,
    createdAt: new Date(record.created_at).toISOString(),
    user: {
      name: record.user_name,
      email: record.user_email,
    },
    pricingModel: record.pricing_model,
    experienceMultiplier: {
      designer: `Level ${record.experience_designer}`,
      freelance: `Level ${record.experience_freelance}`,
    },
    geographyMultiplier: {
      designerCountry: designerCode,
      clientCountry: clientCode,
    },
    services,
    overheadCosts,
    finalPrice: Number(record.final_price),
  };
}
