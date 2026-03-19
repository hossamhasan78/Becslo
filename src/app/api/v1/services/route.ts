import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')

    let query = supabase
      .from('services')
      .select('id, name, default_hours, min_hours, max_hours, base_rate, category_id')
      .eq('is_active', true)
      .order('name')

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in services API:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
