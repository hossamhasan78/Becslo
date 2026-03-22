import type { SupabaseClient } from '@supabase/supabase-js'
import type { AnalyticsMetrics, MostUsedService, TopClientCountry } from '@/types/admin'

/**
 * Aggregate analytics metrics from calculations
 * Performance target: < 3 seconds for up to 10,000 calculations
 */
export async function getAnalyticsMetrics(
  supabase: SupabaseClient,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsMetrics> {
  // Get calculations query with date range filter
  let calculationsQuery = supabase
    .from('calculations')
    .select('final_price, total_hours, created_at')

  if (startDate) {
    calculationsQuery = calculationsQuery.gte('created_at', startDate)
  }
  if (endDate) {
    calculationsQuery = calculationsQuery.lte('created_at', `${endDate}T23:59:59.999Z`)
  }

  const { data: calculations, error: calcError } = await calculationsQuery

  if (calcError) {
    throw new Error(`Failed to fetch calculations: ${calcError.message}`)
  }

  // Calculate averages and total count
  const totalCalculations = calculations?.length || 0
  let totalPrice = 0
  let totalHours = 0

  if (calculations && calculations.length > 0) {
    calculations.forEach((calc) => {
      totalPrice += calc.final_price || 0
      totalHours += calc.total_hours || 0
    })
  }

  const averagePrice =
    totalCalculations > 0 ? Math.round(totalPrice / totalCalculations) : 0
  const averageHours =
    totalCalculations > 0
      ? Math.round((totalHours / totalCalculations) * 10) / 10
      : 0

  // Get most used services
  const mostUsedServices = await getMostUsedServices(
    supabase,
    startDate,
    endDate,
    10
  )

  // Get top client countries
  const topClientCountries = await getTopClientCountries(
    supabase,
    startDate,
    endDate,
    10
  )

  return {
    average_price: averagePrice,
    average_hours: averageHours,
    total_calculations: totalCalculations,
    most_used_services: mostUsedServices,
    top_client_countries: topClientCountries,
  }
}

/**
 * Get most used services based on calculation data
 * Ordered by usage count (highest first)
 */
export async function getMostUsedServices(
  supabase: SupabaseClient,
  startDate?: string,
  endDate?: string,
  limit: number = 10
): Promise<MostUsedService[]> {
  // Get calculation IDs within date range
  let calcQuery = supabase
    .from('calculations')
    .select('id, created_at')

  if (startDate) {
    calcQuery = calcQuery.gte('created_at', startDate)
  }
  if (endDate) {
    calcQuery = calcQuery.lte('created_at', `${endDate}T23:59:59.999Z`)
  }

  const { data: calculations, error: calcError } = await calcQuery

  if (calcError) {
    throw new Error(`Failed to fetch calculations: ${calcError.message}`)
  }

  if (!calculations || calculations.length === 0) {
    return []
  }

  const calculationIds = calculations.map((c) => c.id)

  if (calculationIds.length === 0) {
    return []
  }

  // Get calculation services with service_id
  const { data: calcServices, error: csError } = await supabase
    .from('calculation_services')
    .select('service_id')
    .in('calculation_id', calculationIds)

  if (csError) {
    throw new Error(`Failed to fetch calculation services: ${csError.message}`)
  }

  if (!calcServices || calcServices.length === 0) {
    return []
  }

  // Get unique service IDs
  const serviceIds = [...new Set(
    calcServices
      .map(cs => cs.service_id)
      .filter((id): id is string => id !== null)
  )]

  if (serviceIds.length === 0) {
    return []
  }

  // Fetch service details
  const { data: services, error: serviceError } = await supabase
    .from('services')
    .select('id, name')
    .in('id', serviceIds)

  if (serviceError) {
    throw new Error(`Failed to fetch services: ${serviceError.message}`)
  }

  const serviceMap = new Map(
    services?.map(s => [s.id, s.name]) || []
  )

  // Aggregate service usage counts
  const serviceCounts = new Map<
    string,
    { service_id: string; service_name: string; count: number }
  >()

  calcServices.forEach((cs) => {
    if (cs.service_id) {
      const existing = serviceCounts.get(cs.service_id)
      if (existing) {
        existing.count += 1
      } else {
        serviceCounts.set(cs.service_id, {
          service_id: cs.service_id,
          service_name: serviceMap.get(cs.service_id) || 'Unknown',
          count: 1,
        })
      }
    }
  })

  // Convert to array, sort by count, and return top N
  const result = Array.from(serviceCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return result
}

/**
 * Get top client countries based on calculation data
 * Ordered by calculation count (highest first)
 */
export async function getTopClientCountries(
  supabase: SupabaseClient,
  startDate?: string,
  endDate?: string,
  limit: number = 10
): Promise<TopClientCountry[]> {
  // Get calculations with client_country_id within date range
  let calcQuery = supabase
    .from('calculations')
    .select('client_country_id, created_at')

  if (startDate) {
    calcQuery = calcQuery.gte('created_at', startDate)
  }
  if (endDate) {
    calcQuery = calcQuery.lte('created_at', `${endDate}T23:59:59.999Z`)
  }

  const { data: calculations, error: calcError } = await calcQuery

  if (calcError) {
    throw new Error(`Failed to fetch calculations: ${calcError.message}`)
  }

  if (!calculations || calculations.length === 0) {
    return []
  }

  // Get unique client country IDs
  const countryIds = [...new Set(
    calculations
      .map(c => c.client_country_id)
      .filter((id): id is string => id !== null)
  )]

  if (countryIds.length === 0) {
    return []
  }

  // Fetch country details
  const { data: countries, error: countryError } = await supabase
    .from('countries')
    .select('id, name')
    .in('id', countryIds)

  if (countryError) {
    throw new Error(`Failed to fetch countries: ${countryError.message}`)
  }

  const countryMap = new Map(
    countries?.map(c => [c.id, c.name]) || []
  )

  // Aggregate country counts
  const countryCounts = new Map<
    string,
    { country_id: string; country_name: string; count: number }
  >()

  calculations.forEach((calc) => {
    if (calc.client_country_id) {
      const existing = countryCounts.get(calc.client_country_id)
      if (existing) {
        existing.count += 1
      } else {
        countryCounts.set(calc.client_country_id, {
          country_id: calc.client_country_id,
          country_name: countryMap.get(calc.client_country_id) || 'Unknown',
          count: 1,
        })
      }
    }
  })

  // Convert to array, sort by count, and return top N
  const result = Array.from(countryCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return result
}
