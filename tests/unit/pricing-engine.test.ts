import { describe, it, expect } from 'vitest'
import { calculatePrice } from '@/lib/pricing-engine'

describe('Pricing Engine', () => {
  const mockCountries = [
    { code: 'US', multiplier: 1.0 },
    { code: 'UK', multiplier: 1.2 },
  ]

  const mockCosts = [
    { id: '1', isFixedAmount: true, defaultCost: 100 },
    { id: '2', isFixedAmount: false, defaultCost: 50 },
  ]

  const mockServices = [
    { id: '1', name: 'Design', baseRate: 50 },
    { id: '2', name: 'Development', baseRate: 75 },
  ]

  it('should calculate base price correctly for a single service', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.baseCost).toBe(12500)
    expect(result.finalPrice).toBe(12500)
  })

  it('should apply experience multiplier correctly', () => {
    const input1 = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const input2 = {
      ...input1,
      designerExperience: 10,
      freelanceExperience: 10,
    }

    const result1 = calculatePrice(input1, mockCountries, mockCosts, mockServices)
    const result2 = calculatePrice(input2, mockCountries, mockCosts, mockServices)

    expect(result2.baseCost).toBeGreaterThan(result1.baseCost)
    expect(result1.baseCost).toBe(12500)
    expect(result2.baseCost).toBe(50000)
  })

  it('should apply geography multiplier correctly', () => {
    const input1 = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const input2 = {
      ...input1,
      designerCountryCode: 'UK',
      clientCountryCode: 'UK',
    }

    const result1 = calculatePrice(input1, mockCountries, mockCosts, mockServices)
    const result2 = calculatePrice(input2, mockCountries, mockCosts, mockServices)

    expect(result2.baseCost).toBeGreaterThan(result1.baseCost)
    expect(result1.baseCost).toBe(12500)
    expect(result2.baseCost).toBe(18000)
  })

  it('should calculate overhead costs correctly', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: ['1'],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.overheadCosts).toBe(100)
    expect(result.subtotal).toBe(12600)
  })

  it('should calculate risk buffer correctly', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 10,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.riskBufferAmount).toBe(1250)
    expect(result.finalPrice).toBe(13750)
  })

  it('should calculate profit margin correctly', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 20,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.profitMarginAmount).toBe(2500)
    expect(result.finalPrice).toBe(15000)
  })

  it('should calculate recommended range correctly', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.recommendedMin).toBe(10000)
    expect(result.recommendedMax).toBe(15000)
  })

  it('should handle multiple services', () => {
    const input = {
      services: [
        { serviceId: '1', hours: 10 },
        { serviceId: '2', hours: 5 },
      ],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.baseCost).toBe(21875)
    expect(result.breakdown).toHaveLength(2)
  })

  it('should include service breakdown', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.breakdown).toHaveLength(1)
    expect(result.breakdown[0].serviceId).toBe('1')
    expect(result.breakdown[0].serviceName).toBe('Design')
    expect(result.breakdown[0].hours).toBe(10)
    expect(result.breakdown[0].baseRate).toBe(50)
  })

  it('should handle zero hours', () => {
    const input = {
      services: [{ serviceId: '1', hours: 0 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.baseCost).toBe(0)
    expect(result.finalPrice).toBe(0)
  })

  it('should handle maximum hours', () => {
    const input = {
      services: [{ serviceId: '1', hours: 1000 }],
      designerExperience: 10,
      freelanceExperience: 10,
      designerCountryCode: 'UK',
      clientCountryCode: 'UK',
      selectedCosts: ['1'],
      riskBufferPercent: 50,
      profitMarginPercent: 50,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.baseCost).toBeGreaterThan(0)
    expect(result.finalPrice).toBeGreaterThan(result.baseCost)
    expect(result.riskBufferAmount).toBeGreaterThan(0)
    expect(result.profitMarginAmount).toBeGreaterThan(0)
  })

  it('should handle very large experience values', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 10,
      freelanceExperience: 10,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.experienceMultiplier).toBe(100)
    expect(result.baseCost).toBe(50000)
  })

  it('should handle minimum experience values', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 1,
      freelanceExperience: 1,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.experienceMultiplier).toBe(1)
    expect(result.baseCost).toBe(500)
  })

  it('should handle empty services array', () => {
    const input = {
      services: [],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.baseCost).toBe(0)
    expect(result.finalPrice).toBe(0)
    expect(result.breakdown).toHaveLength(0)
  })

  it('should handle multiple selected costs', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: ['1', '2'],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.overheadCosts).toBe(150)
    expect(result.subtotal).toBe(12650)
  })

  it('should handle maximum risk buffer percentage', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 50,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.riskBufferAmount).toBe(6250)
    expect(result.finalPrice).toBe(18750)
  })

  it('should handle maximum profit margin percentage', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 50,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.profitMarginAmount).toBe(6250)
    expect(result.finalPrice).toBe(18750)
  })

  it('should handle both maximum risk and profit percentages', () => {
    const input = {
      services: [{ serviceId: '1', hours: 10 }],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 50,
      profitMarginPercent: 50,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.riskBufferAmount).toBe(6250)
    expect(result.profitMarginAmount).toBe(9375)
    expect(result.finalPrice).toBe(28125)
  })

  it('should calculate recommended range correctly for high prices', () => {
    const input = {
      services: [{ serviceId: '1', hours: 100 }],
      designerExperience: 10,
      freelanceExperience: 10,
      designerCountryCode: 'UK',
      clientCountryCode: 'UK',
      selectedCosts: ['1'],
      riskBufferPercent: 25,
      profitMarginPercent: 25,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.recommendedMin).toBeLessThan(result.finalPrice)
    expect(result.recommendedMax).toBeGreaterThan(result.finalPrice)
    const rangeDiff = result.recommendedMax - result.recommendedMin
    expect(rangeDiff).toBe(Math.round(result.finalPrice * 0.4))
  })

  it('should handle mixed service types with different base rates', () => {
    const input = {
      pricingModel: 'hourly',
      services: [
        { serviceId: '1', hours: 10 },
        { serviceId: '2', hours: 5 },
      ],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 0,
      profitMarginPercent: 0,
    }

    const result = calculatePrice(input, mockCountries, mockCosts, mockServices)

    expect(result.baseCost).toBe(21875)
    expect(result.breakdown).toHaveLength(2)
  })
})
