import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category')

  let query = supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (categoryId) {
    query = query.eq('category_id', parseInt(categoryId))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
