import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createElement } from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { QuoteDocument } from '@/components/wizard/pdf/QuoteDocument';
import { mapCalculationToPDFData, DBCalculationRecord } from '@/lib/pdf/hydration';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // T008: Implement session-based authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extrapolate ID from search params
    const { searchParams } = new URL(request.url);
    const calculationId = searchParams.get('id');

    if (!calculationId) {
      return NextResponse.json({ error: 'Missing calculation ID' }, { status: 400 });
    }

    // T009: Implement server-side calculation hydration from Supabase
    // Fetch calculation with needed relations to satisfy PDFData model
    const { data: rawData, error: dbError } = await supabase
      .from('calculations')
      .select(`
        *,
        designer_country:countries!calculations_designer_country_id_fkey(name, code, multiplier),
        client_country:countries!calculations_client_country_id_fkey(name, code, multiplier),
        calculation_services(
          hours,
          adjusted_rate,
          cost,
          services:services!calculation_services_service_id_fkey(name)
        )
      `)
      .eq('id', calculationId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !rawData) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch calculation or not found' }, { status: 404 });
    }

    // T009: Use reusable mapper
    const pdfData = mapCalculationToPDFData(rawData as unknown as DBCalculationRecord);

    // T010: Integrate QuoteDocument
    const documentElement = createElement(QuoteDocument, { data: pdfData });
    
    // Compile PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(documentElement as any);

    // Convert NodeJS stream to a Web Stream or buffer for Next.js 14 Web Response
    // We convert it to a full buffer to guarantee we send Content-Length correctly and avoid NextJS runtime chunks warnings
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // T007: Basic binary streaming response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Becslo_Quote_${pdfData.calculationId.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (err) {
    console.error('PDF Export Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
