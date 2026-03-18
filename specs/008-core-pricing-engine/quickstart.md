# Quickstart Guide: Core Pricing Engine

**Feature**: 008-core-pricing-engine
**Date**: 2026-03-18
**Status**: Phase 1 Design

## Overview

This guide provides quick onboarding for developers working on the Core Pricing Engine feature. It covers setup, key concepts, and common workflows.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository access
- Supabase project credentials (provided via environment variables)

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/[org]/becslo.git
cd becslo

# Install dependencies
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Apply Supabase migrations:

```bash
npx supabase db push
```

Verify tables exist:
- `users`
- `services`
- `categories`
- `countries`
- `costs`
- `config`
- `calculations`
- `calculation_services`

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Project Structure

```
app/
├── api/
│   ├── calculate/
│   │   └── route.ts          # POST /api/calculate
│   ├── services/
│   │   └── route.ts          # GET /api/services
│   ├── categories/
│   │   └── route.ts          # GET /api/categories
│   ├── countries/
│   │   └── route.ts          # GET /api/countries
│   ├── costs/
│   │   └── route.ts          # GET /api/costs
│   └── config/
│       └── route.ts          # GET /api/config
├── wizard/
│   ├── page.tsx              # Wizard page
│   └── components/
│       ├── live-preview.tsx  # Real-time preview
│       └── step-inputs/      # Step-specific inputs
└── admin/
    └── analytics/            # Admin dashboard (Phase 5)

lib/
├── pricing-engine.ts          # Core calculation logic
├── types/
│   ├── pricing.ts             # Pricing types
│   └── validation.ts          # Zod schemas
├── utils/
│   ├── formatting.ts          # Currency formatting
│   └── validation.ts          # Validation helpers
└── supabase/
    └── client.ts              # Supabase client

components/
├── context/
│   └── PricingContext.tsx     # Global pricing state
└── ui/                         # Reusable UI components

tests/
├── unit/
│   ├── pricing-engine.test.ts
│   └── validation.test.ts
└── integration/
    └── calculation-flow.test.tsx
```

---

## Key Concepts

### 1. Pricing Engine

The pricing engine is a pure function that calculates project fees:

```typescript
import { calculatePrice } from '@/lib/pricing-engine'

const result = calculatePrice({
  services: [
    { serviceId: 'uuid', hours: 5 }
  ],
  designerExperience: 5,
  freelanceExperience: 7,
  designerCountryCode: 'US',
  clientCountryCode: 'DE',
  selectedCosts: ['uuid'],
  riskBufferPercent: 15,
  profitMarginPercent: 25
})

console.log(result.finalPrice) // 18688
```

### 2. Pricing Context

Global state management for pricing inputs:

```typescript
import { usePricing } from '@/components/context/PricingContext'

function MyComponent() {
  const { pricing, setPricing, calculate } = usePricing()

  const handleExperienceChange = (value: number) => {
    setPricing(prev => ({
      ...prev,
      designerExperience: value
    }))
  }

  return (
    <input
      type="number"
      value={pricing.designerExperience}
      onChange={(e) => handleExperienceChange(Number(e.target.value))}
    />
  )
}
```

### 3. Real-Time Preview

Automatic price updates as users adjust inputs:

```typescript
import { LivePreview } from '@/components/ui/live-preview'

function WizardPage() {
  return (
    <div className="flex">
      <div className="w-3/4">
        {/* Input components */}
      </div>
      <div className="w-1/4">
        <LivePreview />
      </div>
    </div>
  )
}
```

---

## Common Workflows

### Workflow 1: Add New Service Type

1. **Add service to database**:

```sql
INSERT INTO services (id, name, category_id, default_hours, min_hours, max_hours, base_rate, is_active)
VALUES ('uuid', 'New Service', 'category_uuid', 40, 10, 100, 100, true);
```

2. **Test calculation**:

```typescript
import { calculatePrice } from '@/lib/pricing-engine'

const result = calculatePrice({
  services: [
    { serviceId: 'uuid', hours: 40 }
  ],
  designerExperience: 5,
  freelanceExperience: 5,
  designerCountryCode: 'US',
  clientCountryCode: 'US',
  selectedCosts: [],
  riskBufferPercent: 15,
  profitMarginPercent: 25
})
```

3. **Add unit test**:

```typescript
// tests/unit/pricing-engine.test.ts
test('calculates new service correctly', () => {
  const result = calculatePrice({
    services: [{ serviceId: 'uuid', hours: 40 }],
    // ... other inputs
  })
  expect(result.breakdown[0].serviceName).toBe('New Service')
})
```

---

### Workflow 2: Update Validation Rules

1. **Update Zod schema**:

```typescript
// lib/types/validation.ts
export const PricingInputSchema = z.object({
  designerExperience: z.number().min(1).max(10).describe('Designer experience level'),
  freelanceExperience: z.number().min(1).max(15).describe('Freelance experience level') // Changed from 10 to 15
})
```

2. **Update validation tests**:

```typescript
test('validates experience up to 15', () => {
  const result = PricingInputSchema.safeParse({
    designerExperience: 5,
    freelanceExperience: 15, // New max value
    // ... other inputs
  })
  expect(result.success).toBe(true)
})
```

---

### Workflow 3: Add New Cost Type

1. **Add cost to database**:

```sql
INSERT INTO costs (id, name, is_fixed_amount, default_cost, is_active)
VALUES ('uuid', 'New Cost', true, 500, true);
```

2. **Update cost API response** (no code changes needed)

3. **Test in wizard**:

```typescript
import { usePricing } from '@/components/context/PricingContext'

function CostSelection() {
  const { pricing, setPricing } = usePricing()

  const toggleCost = (costId: string) => {
    setPricing(prev => ({
      ...prev,
      selectedCosts: prev.selectedCosts.includes(costId)
        ? prev.selectedCosts.filter(id => id !== costId)
        : [...prev.selectedCosts, costId]
    }))
  }

  return (
    <input
      type="checkbox"
      checked={pricing.selectedCosts.includes('uuid')}
      onChange={() => toggleCost('uuid')}
    />
  )
}
```

---

## Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Write Unit Tests

```typescript
import { calculatePrice } from '@/lib/pricing-engine'

describe('Pricing Engine', () => {
  it('calculates final price correctly', () => {
    const result = calculatePrice({
      services: [
        { serviceId: 'uuid', hours: 10 }
      ],
      designerExperience: 5,
      freelanceExperience: 5,
      designerCountryCode: 'US',
      clientCountryCode: 'US',
      selectedCosts: [],
      riskBufferPercent: 15,
      profitMarginPercent: 25
    })

    expect(result.finalPrice).toBeGreaterThan(0)
    expect(result.breakdown).toHaveLength(1)
  })

  it('handles edge case: zero hours', () => {
    const result = calculatePrice({
      services: [
        { serviceId: 'uuid', hours: 0 }
      ],
      // ... other inputs
    })

    expect(result.baseCost).toBe(0)
  })
})
```

### Write E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('user can calculate project price', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to wizard
  await page.goto('/wizard')

  // Enter pricing inputs
  await page.selectOption('select[name="services"]', 'UI Design')
  await page.fill('input[name="hours"]', '10')
  await page.fill('input[name="designerExperience"]', '5')
  await page.fill('input[name="freelanceExperience"]', '7')
  await page.selectOption('select[name="designerCountry"]', 'United States')
  await page.selectOption('select[name="clientCountry"]', 'Germany')

  // Verify price updates
  const finalPrice = await page.textContent('[data-testid="final-price"]')
  expect(finalPrice).toMatch(/\$\d+/)
})
```

---

## Debugging

### Common Issues

**Issue 1: Validation Error**

```typescript
// Check Zod schema errors
import { PricingInputSchema } from '@/lib/types/validation'

const result = PricingInputSchema.safeParse(input)
if (!result.success) {
  console.error(result.error.flatten())
}
```

**Issue 2: Wrong Price Calculation**

```typescript
// Log intermediate values
console.log('Experience multiplier:', designerExperience * freelanceExperience)
console.log('Geography multiplier:', designerMultiplier * clientMultiplier)
console.log('Adjusted rate:', baseRate * experienceMultiplier * geographyMultiplier)
```

**Issue 3: Real-Time Preview Not Updating**

```typescript
// Check context updates
import { usePricing } from '@/components/context/PricingContext'

function MyComponent() {
  const { pricing } = usePricing()
  console.log('Current pricing:', pricing)
}
```

---

## Performance Optimization

### Memoization

```typescript
import { useMemo } from 'react'

function LivePreview({ pricing }) {
  const result = useMemo(() => {
    return calculatePrice(pricing)
  }, [pricing])

  return <div>{formatCurrency(result.finalPrice)}</div>
}
```

### Debouncing

```typescript
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

function InputComponent({ onChange }) {
  const [value, setValue] = useState('')

  const debouncedOnChange = useMemo(
    () => debounce(onChange, 100),
    [onChange]
  )

  useEffect(() => {
    return () => debouncedOnChange.cancel()
  }, [debouncedOnChange])

  return (
    <input
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedOnChange(e.target.value)
      }}
    />
  )
}
```

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Environment Variables in Vercel

Configure in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Additional Resources

- [Spec Documentation](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-contracts.md)
- [Research Findings](./research.md)
- [Project Constitution](../../.specify/memory/constitution.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev)

---

## Getting Help

- Review this quickstart guide
- Check unit tests for examples
- Read API contracts for endpoint details
- Consult data model for entity relationships
- Ask team lead for architecture questions
