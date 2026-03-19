# Quickstart: PDF Export

## Setup
1. **Required Libraries**:
    - `@react-pdf/renderer`: Core generation engine.
    - `lucide-react`: Branding icons (optional).
2. **Local Environment Settings**:
    - Ensure your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured for API hydration.

## Core Files to Create/Modify
1. **API Route Handler**: `src/app/api/v1/export-pdf/route.ts` - Implement `POST` handler for calculation hydration and PDF streaming.
2. **Template Component**: `src/components/wizard/QuoteDocument.tsx` - Using `@react-pdf/renderer` primitive components (`<Document>`, `<Page>`, `<Text>`, `<View>`).
3. **Wizard UI Update**: `src/components/wizard/steps/ReviewStep.tsx` - Add `handleDownloadPDF` and loading state management.

## Development Workflow
1. **Hydrate Data**: Fetch calculation details from Supabase using user's session.
2. **Style the Template**: Map JSON to `<View>` layouts.
3. **Verify Precision**: Log `finalPrice` and compare with UI.
4. **Trigger Download**: Test the UI-to-API-to-Download flow.

## Local PDF Verification
- Since the PDF is generated on the server, use `console.log` for hydration debugging.
- Verify fonts load and render correctly locally before pushing.
