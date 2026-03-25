import { z } from 'zod';
import type { PricingInput, PricingOutput, ServiceBreakdown } from './pricing';

export const ServiceInputSchema = z.object({
  serviceId: z.string().uuid(),
  hours: z.number().min(0, 'Hours must be non-negative'),
});

export const PricingInputSchema = z.object({
  pricingModel: z.enum(['hourly', 'project']),
  services: z.array(ServiceInputSchema).min(1, 'At least one service must be selected'),
  designerExperience: z.number().min(1, 'Designer experience must be at least 1').max(10, 'Designer experience cannot exceed 10'),
  freelanceExperience: z.number().min(1, 'Freelance experience must be at least 1').max(10, 'Freelance experience cannot exceed 10'),
  designerCountryCode: z.string().length(2, 'Country code must be 2 characters'),
  clientCountryCode: z.string().length(2, 'Country code must be 2 characters'),
  selectedCosts: z.array(z.string().uuid()).optional().default([]),
  riskBufferPercent: z.number().min(0, 'Risk buffer must be at least 0%').max(50, 'Risk buffer cannot exceed 50%'),
  profitMarginPercent: z.number().min(10, 'Profit margin must be at least 10%').max(50, 'Profit margin cannot exceed 50%'),
}) satisfies z.ZodType<PricingInput>;

export const ServiceBreakdownSchema = z.object({
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  hours: z.number(),
  baseRate: z.number(),
  experienceMultiplier: z.number(),
  geographyMultiplier: z.number(),
  adjustedRate: z.number(),
  cost: z.number(),
}) satisfies z.ZodType<ServiceBreakdown>;

export const PricingOutputSchema = z.object({
  baseCost: z.number(),
  overheadCosts: z.number(),
  subtotal: z.number(),
  riskBufferAmount: z.number(),
  profitMarginAmount: z.number(),
  finalPrice: z.number().nonnegative('Final price cannot be negative'),
  recommendedMin: z.number(),
  recommendedMax: z.number(),
  experienceMultiplier: z.number(),
  geographyMultiplier: z.number(),
  breakdown: z.array(ServiceBreakdownSchema),
}) satisfies z.ZodType<PricingOutput>;

export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
  'AUTH_ERROR',
  'NOT_FOUND',
  'INVALID_INPUT',
]);

export const ErrorResponseSchema = z.object({
  success: z.boolean().refine((val) => val === false, { message: 'success must be false' }),
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.object({}).passthrough().optional(),
  }),
});

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
