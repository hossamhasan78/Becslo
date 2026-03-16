# Quickstart: Frontend - Calculator

## Overview

This document covers the Frontend Calculator implementation. The calculator is a 7-step wizard with live preview panel.

## Wizard Structure

### Left Panel (3/4 width)
1. **Pricing Model** - Select hourly or fixed-price
2. **Services** - Select services with hours in accordion by category
3. **Experience** - Designer and freelance experience ranges
4. **Geography** - Designer and client country selectors
5. **Costs** - Add overhead costs by category
6. **Results Preview** - Calculation breakdown
7. **Export PDF** - Download button

### Right Panel (1/4 width)
- Live calculation preview updating in real-time

## API Integration

| Endpoint | Purpose |
|----------|---------|
| GET /api/services | Fetch services grouped by category |
| GET /api/config | Fetch pricing configuration |
| GET /api/countries | Fetch country list |
| POST /api/calculation | Store calculation (for auth users) |
| POST /api/export-pdf | Generate PDF export |

## Component Structure

```
src/components/wizard/
├── PricingModelStep.tsx    # Step 1: Pricing model selection
├── ServiceSelectionStep.tsx # Step 2: Services with hours
├── ExperienceStep.tsx       # Step 3: Experience ranges
├── GeographyStep.tsx        # Step 4: Country selectors
├── CostsStep.tsx            # Step 5: Overhead costs
├── ResultsPreviewStep.tsx    # Step 6: Final breakdown
└── ExportPdfStep.tsx        # Step 7: PDF export

src/components/
└── WizardContext.tsx       # Global state management
```

## Development

```bash
# Start development server
npm run dev

# Navigate to calculator
http://localhost:3000
```

## Verification Checklist

- [ ] Wizard loads with 3/4 left panel, 1/4 right panel
- [ ] All 7 steps are navigable
- [ ] Services grouped by category in accordion
- [ ] Experience selectors show correct ranges
- [ ] Country dropdowns populated from API
- [ ] Costs can be added with name, amount, type
- [ ] Live preview updates within 100ms
- [ ] PDF export generates and downloads

## Next Steps

After frontend calculator is complete:
- Phase 4: Frontend - Admin dashboard
