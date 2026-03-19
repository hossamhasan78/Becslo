import { describe, it, expect } from 'vitest';
import { mapCalculationToPDFData, DBCalculationRecord } from '../../src/lib/pdf/hydration';

describe('PDF Hydration Data Mapping', () => {
  it('maps complete DB records to PDFQuoteData correctly', () => {
    const mockDBRecord: DBCalculationRecord = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      pricing_model: 'hourly',
      experience_designer: 5,
      experience_freelance: 3,
      subtotal: 1000,
      risk_buffer: 100,
      profit_margin: 200,
      final_price: 1300,
      created_at: '2026-03-19T07:00:00Z',
      designer_country: { name: 'United States', code: 'US', multiplier: 1 },
      client_country: { name: 'United Kingdom', code: 'GB', multiplier: 1 },
      calculation_services: [
        {
          hours: 10,
          adjusted_rate: 100,
          cost: 1000,
          services: { name: 'UI Design' },
        },
      ],
    };

    const pdfData = mapCalculationToPDFData(mockDBRecord);

    expect(pdfData.calculationId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(pdfData.user.name).toBe('John Doe');
    expect(pdfData.user.email).toBe('john@example.com');
    expect(pdfData.pricingModel).toBe('hourly');
    expect(pdfData.finalPrice).toBe(1300);

    // Verify services
    expect(pdfData.services).toHaveLength(1);
    expect(pdfData.services[0].name).toBe('UI Design');
    expect(pdfData.services[0].hours).toBe(10);
    expect(pdfData.services[0].rate).toBe(100);
    expect(pdfData.services[0].totalCost).toBe(1000);

    // Verify overhead costs mapping
    expect(pdfData.overheadCosts).toHaveLength(2);
    expect(pdfData.overheadCosts[0].name).toBe('Risk Buffer');
    expect(pdfData.overheadCosts[0].value).toBe(100);
    expect(pdfData.overheadCosts[1].name).toBe('Profit Margin');
    expect(pdfData.overheadCosts[1].value).toBe(200);

    // Verify multipliers
    expect(pdfData.experienceMultiplier.designer).toBe('Level 5');
    expect(pdfData.experienceMultiplier.freelance).toBe('Level 3');
    expect(pdfData.geographyMultiplier.designerCountry).toBe('US');
    expect(pdfData.geographyMultiplier.clientCountry).toBe('GB');
  });

  it('handles missing or incomplete joined data safely', () => {
    const minRecord: DBCalculationRecord = {
      id: 'abc-123',
      user_name: 'Jane Doe',
      user_email: 'jane@example.com',
      pricing_model: 'project',
      experience_designer: 8,
      experience_freelance: 8,
      subtotal: 500,
      risk_buffer: 0,
      profit_margin: 0,
      final_price: 500,
      created_at: '2026-03-19T08:00:00Z',
    };

    const pdfData = mapCalculationToPDFData(minRecord);

    expect(pdfData.finalPrice).toBe(500);
    expect(pdfData.overheadCosts).toHaveLength(0); // Zero value buffers omitted
    expect(pdfData.services).toHaveLength(0); // Safe array mapping
    expect(pdfData.geographyMultiplier.designerCountry).toBe('Unknown');
  });
});
