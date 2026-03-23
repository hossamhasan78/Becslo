// This route is deprecated and not used. The wizard uses /api/v1/calculate-and-save instead.
// The legacy /api/calculate route had issues with pricing model handling that caused PDF to always show "hourly"
// The fix was applied to use pricingInput.pricingModel in /api/v1/calculate-and-save route
// This file is preserved for reference but not exported.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'This route is deprecated. Use /api/v1/calculate-and-save instead.' 
  }, { status: 410 });
}