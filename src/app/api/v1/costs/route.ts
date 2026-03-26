import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('costs')
      .select('id, name, is_fixed_amount, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching costs:', error)
      return NextResponse.json({ error: 'Failed to fetch costs' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in costs API:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
