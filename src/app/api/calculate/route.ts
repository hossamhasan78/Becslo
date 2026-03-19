import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PricingInputSchema } from '@/lib/types/validation';
import { calculatePrice } from '@/lib/pricing-engine';
import { validatePricingInput } from '@/lib/utils/validation';
import type { CalculateResponse, ErrorResponse } from '@/lib/types/pricing';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Unauthorized - Please log in to continue',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    const body = await request.json();
    const { save, ...pricingInput } = body;
    
    const validationResult = PricingInputSchema.safeParse(pricingInput);
    
    if (!validationResult.success) {
      const details: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        const path = err.path.join('.');
        details[path] = err.message;
      });
      
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const input = validationResult.data;
    
    const validationErrors = validatePricingInput(input);
    if (validationErrors.length > 0) {
      const details: Record<string, string> = {};
      validationErrors.forEach((err) => {
        details[err.field] = err.message;
      });
      
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input parameters',
          details,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const [countriesResult, costsResult, servicesResult] = await Promise.all([
      supabase
        .from('countries')
        .select('id, code, multiplier')
        .eq('is_active', true),
      supabase
        .from('costs')
        .select('id, is_fixed_amount, default_cost')
        .eq('is_active', true),
      supabase
        .from('services')
        .select('id, name, base_rate')
        .eq('is_active', true),
    ]);
    
    if (countriesResult.error || costsResult.error || servicesResult.error) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch pricing data',
        },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    const countries = countriesResult.data.map(c => ({
      code: c.code,
      multiplier: c.multiplier,
    }));
    
    const costs = costsResult.data.map(c => ({
      id: c.id,
      isFixedAmount: c.is_fixed_amount,
      defaultCost: c.default_cost,
    }));
    
    const services = servicesResult.data.map(s => ({
      id: s.id,
      name: s.name,
      baseRate: s.base_rate,
    }));
    
    const pricingOutput = calculatePrice(input, countries, costs, services);
    
    if (save) {
      const designerCountry = countriesResult.data.find(c => c.code === input.designerCountryCode);
      const clientCountry = countriesResult.data.find(c => c.code === input.clientCountryCode);

      if (!designerCountry || !clientCountry) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid country codes provided',
          },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      const { data: calculationData, error: insertError } = await supabase
        .from('calculations')
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          pricing_model: 'hourly',
          experience_designer: input.designerExperience,
          experience_freelance: input.freelanceExperience,
          designer_country_id: designerCountry.id,
          client_country_id: clientCountry.id,
          total_hours: input.services.reduce((sum, s) => sum + s.hours, 0),
          subtotal: pricingOutput.subtotal,
          risk_buffer: pricingOutput.riskBufferAmount,
          profit_margin: pricingOutput.profitMarginAmount,
          final_price: pricingOutput.finalPrice,
          recommended_min: pricingOutput.recommendedMin,
          recommended_max: pricingOutput.recommendedMax,
        })
        .select('id')
        .single();

      if (insertError || !calculationData) {
        console.error('Failed to save calculation:', insertError);
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to save calculation',
          },
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }

      const { error: servicesInsertError } = await supabase
        .from('calculation_services')
        .insert(
          input.services.map(s => ({
            calculation_id: calculationData.id,
            service_id: s.serviceId,
            hours: s.hours,
            adjusted_rate: pricingOutput.breakdown.find(b => b.serviceId === s.serviceId)?.adjustedRate || 0,
            cost: pricingOutput.breakdown.find(b => b.serviceId === s.serviceId)?.cost || 0,
          }))
        );

      if (servicesInsertError) {
        console.error('Failed to save calculation services:', servicesInsertError);
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to save calculation services',
          },
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }
    }
    
    const response: CalculateResponse = {
      success: true,
      data: pricingOutput,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in calculate API:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
