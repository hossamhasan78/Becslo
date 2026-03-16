import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { calculatePrice, type CalculationInput } from '@/lib/pricing-engine'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient()
    
    const body: CalculationInput = await request.json()
    
    const { data: configData, error: configError } = await supabase
      .from('config')
      .select('key, value')

    if (configError) throw configError

    const config = configData.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, unknown>)

    const result = calculatePrice(body, {
      baseHourlyRate: config.base_hourly_rate as number,
      experienceMultipliers: config.experience_multipliers as Parameters<typeof calculatePrice>[1]['experienceMultipliers'],
      geoMultipliers: config.geo_multipliers as Parameters<typeof calculatePrice>[1]['geoMultipliers'],
      riskBuffer: config.risk_buffer as number
    })

    const { data: { user } } = await supabase.auth.getUser()

    const { data: calculation, error: calcError } = await supabase
      .from('calculations')
      .insert({
        user_id: user?.id || null,
        experience_years: body.experienceYears,
        freelance_years: body.freelanceYears,
        designer_country: body.designerCountry,
        client_country: body.clientCountry,
        pricing_model: body.pricingModel,
        risk_level: body.riskLevel,
        profit_margin: body.profitMargin,
        total_hours: result.totalHours,
        final_price: result.finalPrice
      })
      .select()
      .single()

    if (calcError) throw calcError

    for (const service of body.services) {
      await supabase.from('calculation_services').insert({
        calculation_id: calculation.id,
        service_id: service.serviceId,
        hours: service.hours
      })
    }

    for (const cost of body.costs) {
      await supabase.from('costs').insert({
        calculation_id: calculation.id,
        name: cost.name,
        amount: cost.amount,
        type: cost.type
      })
    }

    return NextResponse.json({
      calculation: {
        id: calculation.id,
        ...result
      }
    })
  } catch (error) {
    console.error('Error storing calculation:', error)
    return NextResponse.json({ error: 'Failed to store calculation' }, { status: 500 })
  }
}
