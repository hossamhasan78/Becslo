import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('config')
      .select('key, value')

    if (error) throw error

    const config = data.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, unknown>)

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}
