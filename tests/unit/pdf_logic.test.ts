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
      recommended_min: 1040,
      recommended_max: 1560,
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
      recommended_min: 400,
      recommended_max: 600,
      created_at: '2026-03-19T08:00:00Z',
    };

    const pdfData = mapCalculationToPDFData(minRecord);

    expect(pdfData.finalPrice).toBe(500);
    expect(pdfData.overheadCosts).toHaveLength(0); // Zero value buffers omitted
    expect(pdfData.services).toHaveLength(0); // Safe array mapping
    expect(pdfData.geographyMultiplier.designerCountry).toBe('Unknown');
  });

  it('calculates service breakdown totals correctly', () => {
    const mockRecord: DBCalculationRecord = {
      id: 'calc-123',
      user_name: 'Alice Smith',
      user_email: 'alice@example.com',
      pricing_model: 'hourly',
      experience_designer: 6,
      experience_freelance: 4,
      subtotal: 2500,
      risk_buffer: 250,
      profit_margin: 500,
      final_price: 3250,
      recommended_min: 2600,
      recommended_max: 3900,
      created_at: '2026-03-19T09:00:00Z',
      calculation_services: [
        {
          hours: 8,
          adjusted_rate: 100,
          cost: 800,
          services: { name: 'UI Design' },
        },
        {
          hours: 10,
          adjusted_rate: 120,
          cost: 1200,
          services: { name: 'Frontend Development' },
        },
        {
          hours: 5,
          adjusted_rate: 100,
          cost: 500,
          services: { name: 'Testing' },
        },
      ],
    };

    const pdfData = mapCalculationToPDFData(mockRecord);

    // Verify each service breakdown
    expect(pdfData.services).toHaveLength(3);
    expect(pdfData.services[0]).toEqual({
      name: 'UI Design',
      hours: 8,
      rate: 100,
      totalCost: 800,
    });
    expect(pdfData.services[1]).toEqual({
      name: 'Frontend Development',
      hours: 10,
      rate: 120,
      totalCost: 1200,
    });
    expect(pdfData.services[2]).toEqual({
      name: 'Testing',
      hours: 5,
      rate: 100,
      totalCost: 500,
    });

    // Verify overhead costs are included
    expect(pdfData.overheadCosts).toHaveLength(2);
    expect(pdfData.overheadCosts[0]).toEqual({
      name: 'Risk Buffer',
      value: 250,
    });
    expect(pdfData.overheadCosts[1]).toEqual({
      name: 'Profit Margin',
      value: 500,
    });
  });

  it('aligns overhead costs with subtotal correctly', () => {
    const record: DBCalculationRecord = {
      id: 'overhead-test',
      user_name: 'Bob Johnson',
      user_email: 'bob@example.com',
      pricing_model: 'hourly',
      experience_designer: 7,
      experience_freelance: 5,
      subtotal: 3000,
      risk_buffer: 300,
      profit_margin: 600,
      final_price: 3900,
      recommended_min: 3120,
      recommended_max: 4680,
      created_at: '2026-03-19T10:00:00Z',
      calculation_services: [
        {
          hours: 20,
          adjusted_rate: 150,
          cost: 3000,
          services: { name: 'Full Stack Development' },
        },
      ],
    };

    const pdfData = mapCalculationToPDFData(record);

    // Verify subtotal from services matches
    const servicesTotal = pdfData.services.reduce((sum, s) => sum + s.totalCost, 0);
    expect(servicesTotal).toBe(3000);

    // Verify overheads are proportional and align with pricing model
    expect(pdfData.overheadCosts).toHaveLength(2);
    const overheadTotal = pdfData.overheadCosts.reduce((sum, o) => sum + o.value, 0);
    expect(overheadTotal).toBe(900);

    // Verify final price calculation alignment
    expect(servicesTotal + overheadTotal).toBe(3900);
    expect(pdfData.finalPrice).toBe(3900);
  });

  it('includes recommended range in PDF data', () => {
    const record: DBCalculationRecord = {
      id: 'range-test',
      user_name: 'Charlie Brown',
      user_email: 'charlie@example.com',
      pricing_model: 'hourly',
      experience_designer: 5,
      experience_freelance: 5,
      subtotal: 2000,
      risk_buffer: 200,
      profit_margin: 300,
      final_price: 2500,
      recommended_min: 2000,
      recommended_max: 3000,
      created_at: '2026-03-19T11:00:00Z',
      calculation_services: [
        {
          hours: 10,
          adjusted_rate: 200,
          cost: 2000,
          services: { name: 'Backend Development' },
        },
      ],
    };

    const pdfData = mapCalculationToPDFData(record);

    expect(pdfData.recommendedRange).toBeDefined();
    expect(pdfData.recommendedRange?.min).toBe(2000);
    expect(pdfData.recommendedRange?.max).toBe(3000);
  });
});
