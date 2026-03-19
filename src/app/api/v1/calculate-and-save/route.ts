import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { pricingInputSchema } from '@/lib/validation/pricing-schema'
import { calculatePrice } from '@/lib/pricing-engine'

export async function POST(req: Request) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
  }

  // 2. Parse and validate input
  try {
    const body = await req.json()
    const validatedInput = pricingInputSchema.safeParse(body)
    
    if (!validatedInput.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validatedInput.error.format() 
      }, { status: 400 })
    }

    const input = validatedInput.data

    // 3. Fetch reference data for server-side calculation
    const [servicesRes, countriesRes, costsRes] = await Promise.all([
      supabase.from('services').select('id, name, base_rate'),
      supabase.from('countries').select('id, code, multiplier'),
      supabase.from('costs').select('id, is_fixed_amount, default_cost')
    ])

    if (servicesRes.error || countriesRes.error || costsRes.error) {
      return NextResponse.json({ error: 'Database error while fetching reference data' }, { status: 500 })
    }

    // Map to the formats required by calculatePrice
    const countries = countriesRes.data.map(c => ({ 
      code: c.code, 
      multiplier: Number(c.multiplier) 
    }))
    
    const costs = costsRes.data.map(c => ({ 
      id: String(c.id), 
      isFixedAmount: c.is_fixed_amount, 
      defaultCost: Number(c.default_cost) 
    }))
    
    const services = servicesRes.data.map(s => ({ 
      id: String(s.id), 
      name: s.name, 
      baseRate: Number(s.base_rate) 
    }))

    // Calculate server-side to ensure integrity
    const pricingResult = calculatePrice(input, countries, costs, services)

    // 4. Insert calculation record
    const { data: calculation, error: calculationError } = await supabase
      .from('calculations')
      .insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        user_email: user.email,
        pricing_model: input.pricingModel,
        experience_designer: input.designerExperience,
        experience_freelance: input.freelanceExperience,
        designer_country_id: countriesRes.data.find(c => c.code === input.designerCountryCode)?.id,
        client_country_id: countriesRes.data.find(c => c.code === input.clientCountryCode)?.id,
        total_hours: pricingResult.breakdown.reduce((sum, item) => sum + item.hours, 0),
        subtotal: pricingResult.subtotal,
        risk_buffer: pricingResult.riskBufferAmount,
        profit_margin: pricingResult.profitMarginAmount,
        final_price: pricingResult.finalPrice,
        recommended_min: pricingResult.recommendedMin,
        recommended_max: pricingResult.recommendedMax
      })
      .select()
      .single()

    if (calculationError) {
      console.error('Calculation Insert Error:', calculationError)
      return NextResponse.json({ error: 'Failed to create calculation record' }, { status: 500 })
    }

    // 5. Insert calculation_services records
    const calculationServices = pricingResult.breakdown.map(item => ({
      calculation_id: calculation.id,
      service_id: Number(item.serviceId),
      hours: item.hours,
      adjusted_rate: item.adjustedRate,
      cost: item.cost
    }))

    const { error: servicesError } = await supabase
      .from('calculation_services')
      .insert(calculationServices)

    if (servicesError) {
      console.error('Service Insert Error:', servicesError)
      // Cleanup orphan calculation record if services fail
      await supabase.from('calculations').delete().match({ id: calculation.id })
      return NextResponse.json({ error: 'Failed to save calculation line items' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      calculationId: calculation.id,
      data: pricingResult
    })

  } catch (error) {
    console.error('Unexpected API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
