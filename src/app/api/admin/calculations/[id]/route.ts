import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ApiResponse, CalculationDetails } from '@/types/admin'

async function getAdminUser(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cookieStore = await cookies()
    
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore errors in read-only context
            }
          },
        },
      }
    )

    const adminUser = await getAdminUser(supabase)

    if (!adminUser) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }
      return NextResponse.json(response, { status: 401 })
    }

    const { data: calculation, error: calcError } = await supabase
      .from('calculations')
      .select('*')
      .eq('id', id)
      .single()

    if (calcError || !calculation) {
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Calculation not found', code: 'NOT_FOUND' }
      }
      return NextResponse.json(response, { status: 404 })
    }

    const { data: designerCountry, error: designerCountryError } = await supabase
      .from('countries')
      .select('name')
      .eq('id', calculation.designer_country_id)
      .single()

    const { data: clientCountry, error: clientCountryError } = await supabase
      .from('countries')
      .select('name')
      .eq('id', calculation.client_country_id)
      .single()

    const { data: calcServices, error: servicesError } = await supabase
      .from('calculation_services')
      .select('service_id, hours, adjusted_rate, cost')
      .eq('calculation_id', id)

    const serviceIds = calcServices?.map(cs => cs.service_id).filter((id): id is string => id !== null) || []
    
    let serviceNames: Record<string, string> = {}
    if (serviceIds.length > 0) {
      const { data: services } = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds)
      
      serviceNames = Object.fromEntries(
        services?.map(s => [s.id, s.name]) || []
      )
    }

    const { data: calcCosts, error: costsError } = await supabase
      .from('calculation_costs')
      .select('cost_id, amount')
      .eq('calculation_id', id)

    let costNames: Record<string, string> = {}
    if (calcCosts && calcCosts.length > 0) {
      const costIds = calcCosts.map(cc => cc.cost_id).filter((id): id is string => id !== null)
      if (costIds.length > 0) {
        const { data: costs } = await supabase
          .from('costs')
          .select('id, name')
          .in('id', costIds)
        
        costNames = Object.fromEntries(
          costs?.map(c => [c.id, c.name]) || []
        )
      }
    }

    const details: CalculationDetails = {
      id: calculation.id,
      user_id: calculation.user_id,
      user_name: calculation.user_name,
      user_email: calculation.user_email,
      pricing_model: calculation.pricing_model,
      experience_designer: calculation.experience_designer,
      experience_freelance: calculation.experience_freelance,
      designer_country_id: calculation.designer_country_id,
      client_country_id: calculation.client_country_id,
      total_hours: calculation.total_hours,
      subtotal: calculation.subtotal,
      risk_buffer: calculation.risk_buffer,
      profit_margin: calculation.profit_margin,
      final_price: calculation.final_price,
      recommended_min: calculation.recommended_min,
      recommended_max: calculation.recommended_max,
      created_at: calculation.created_at,
      designer_country: designerCountry?.name || 'Unknown',
      client_country: clientCountry?.name || 'Unknown',
      services: (calcServices || []).map(cs => ({
        service_name: serviceNames[cs.service_id || ''] || 'Unknown',
        hours: cs.hours,
        adjusted_rate: cs.adjusted_rate,
        cost: cs.cost,
      })),
      costs: (calcCosts || []).map(cc => ({
        cost_name: costNames[cc.cost_id || ''] || 'Unknown',
        amount: cc.amount,
      })),
      multipliers: {
        experience_multiplier: calculation.experience_designer * calculation.experience_freelance,
        geography_multiplier: designerCountry && clientCountry ? 
          (await getGeographyMultiplier(supabase, calculation.designer_country_id, calculation.client_country_id)) : 1,
        base_rate: calculation.subtotal / calculation.total_hours,
      },
    }

    const response: ApiResponse<CalculationDetails> = {
      data: details,
      error: null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error)
    const response: ApiResponse<null> = {
      data: null,
      error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
    }
    return NextResponse.json(response, { status: 500 })
  }
}

async function getGeographyMultiplier(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  designerCountryId: string,
  clientCountryId: string
): Promise<number> {
  const { data: designerCountry } = await supabase
    .from('countries')
    .select('multiplier')
    .eq('id', designerCountryId)
    .single()

  const { data: clientCountry } = await supabase
    .from('countries')
    .select('multiplier')
    .eq('id', clientCountryId)
    .single()

  const designerMultiplier = designerCountry?.multiplier || 1
  const clientMultiplier = clientCountry?.multiplier || 1

  return designerMultiplier / clientMultiplier
}
