import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [totalUsers, totalCalculations, avgPrice, avgHours, topServices, topCountries] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('calculations').select('id', { count: 'exact', head: true }),
      supabase.from('calculations').select('final_price').then(({ data }) => {
        if (!data || data.length === 0) return 0
        return data.reduce((sum, c) => sum + c.final_price, 0) / data.length
      }),
      supabase.from('calculations').select('total_hours').then(({ data }) => {
        if (!data || data.length === 0) return 0
        return data.reduce((sum, c) => sum + c.total_hours, 0) / data.length
      }),
      supabase
        .from('calculation_services')
        .select('service_id')
        .then(({ data }) => {
          if (!data) return []
          const counts: Record<string, number> = {}
          data.forEach(s => {
            counts[s.service_id] = (counts[s.service_id] || 0) + 1
          })
          return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([serviceId, count]) => ({ serviceId, count }))
        }),
      supabase
        .from('calculations')
        .select('client_country')
        .then(({ data }) => {
          if (!data) return []
          const counts: Record<string, number> = {}
          data.forEach(c => {
            counts[c.client_country] = (counts[c.client_country] || 0) + 1
          })
          return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([country, count]) => ({ country, count }))
        })
    ])

    return NextResponse.json({
      totalUsers: totalUsers.count || 0,
      totalCalculations: totalCalculations.count || 0,
      averagePrice: Math.round(avgPrice),
      averageHours: Math.round(avgHours),
      topServices,
      topCountries
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
