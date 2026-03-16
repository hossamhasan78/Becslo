import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { calculatePrice, type CalculationInput } from '@/lib/pricing-engine'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePDF } from '@/components/QuotePDF'

export async function POST(request: NextRequest) {
  try {
    const body: { input: CalculationInput } = await request.json()
    
    const supabase = createClient()
    
    const { data: configData } = await supabase
      .from('config')
      .select('key, value')

    const config = configData?.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, unknown>) || {}

    const result = calculatePrice(body.input, {
      baseHourlyRate: (config.base_hourly_rate as number) || 75,
      experienceMultipliers: (config.experience_multipliers as Parameters<typeof calculatePrice>[1]['experienceMultipliers']) || {
        designer: { '0-2': 0.7, '3-5': 1.0, '6-9': 1.3, '10+': 1.6 },
        freelance: { '0-1': 0.8, '2-3': 1.0, '4-6': 1.2, '7+': 1.4 }
      },
      geoMultipliers: (config.geo_multipliers as Parameters<typeof calculatePrice>[1]['geoMultipliers']) || {},
      riskBuffer: (config.risk_buffer as number) || 10
    })

    const pdfBuffer = await renderToBuffer(QuotePDF({ input: body.input, result }))

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="quote.pdf"'
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
