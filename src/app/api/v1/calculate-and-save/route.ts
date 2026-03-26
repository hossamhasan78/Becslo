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
    const [servicesRes, countriesRes] = await Promise.all([
      supabase.from('services').select('id, name, base_rate'),
      supabase.from('countries').select('id, code, multiplier')
    ])

    if (servicesRes.error || countriesRes.error) {
      return NextResponse.json({ error: 'Database error while fetching reference data' }, { status: 500 })
    }

    // Map to formats required by calculatePrice
    const countries = countriesRes.data.map(c => ({
      code: c.code,
      multiplier: Number(c.multiplier)
    }))

    const services = servicesRes.data.map(s => ({
      id: String(s.id),
      name: s.name,
      baseRate: Number(s.base_rate)
    }))

    // Calculate server-side to ensure integrity
    const pricingResult = calculatePrice(input, countries, services)

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

    // 6. Insert calculation_costs records (skip if none selected)
    const calculationCosts = input.selectedCosts
      .filter(c => c.amount > 0)
      .map(c => ({
        calculation_id: calculation.id,
        cost_id: Number(c.costId),
        cost_name: c.costName,
        amount: c.amount
      }))

    if (calculationCosts.length > 0) {
      const { error: costsError } = await supabase
        .from('calculation_costs')
        .insert(calculationCosts)

      if (costsError) {
        console.error('Costs Insert Error:', costsError)
        // Cleanup orphan calculation and services if costs fail
        await supabase.from('calculations').delete().match({ id: calculation.id })
        return NextResponse.json({ error: 'Failed to save calculation costs' }, { status: 500 })
      }
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
