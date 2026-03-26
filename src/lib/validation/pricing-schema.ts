import { z } from 'zod';

export const pricingInputSchema = z.object({
  pricingModel: z.enum(['hourly', 'project']),
  services: z.array(z.object({
    serviceId: z.string().or(z.number()).transform(v => String(v)),
    hours: z.number().min(1)
  })).min(1),
  designerExperience: z.number().min(1).max(10),
  freelanceExperience: z.number().min(1).max(10),
  designerCountryCode: z.string().length(2),
  clientCountryCode: z.string().length(2),
  selectedCosts: z.array(z.object({
    costId: z.string(),
    costName: z.string().min(1),
    amount: z.number().min(0).max(999999)
  })),
  riskBufferPercent: z.number().min(0).max(50),
  profitMarginPercent: z.number().min(10).max(50)
});

export type PricingInputSchema = z.infer<typeof pricingInputSchema>;
