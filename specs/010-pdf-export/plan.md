# Implementation Plan: PDF Export

**Branch**: `010-pdf-export` | **Date**: 2026-03-19 | **Spec**: [spec.md](file:///E:/Projects/Digital%20Products/Becslo/Ver02/Becslo/specs/010-pdf-export/spec.md)
**Input**: Feature specification from `/specs/010-pdf-export/spec.md`

## Summary
Implement a high-fidelity PDF quote generation system as an authenticated Next.js API route (`POST /api/v1/export-pdf`). The system will hydrate a `@react-pdf/renderer` template with the user's specific calculation details (including service breakdown, regional multipliers, and overheads) and stream the result directly back to the browser for instant, non-storage-based download.

## Technical Context
- **Language/Version**: TypeScript / Next.js 14.x
- **Primary Dependencies**: `@react-pdf/renderer`, `supabase-js`, `lucide-react`
- **Storage**: N/A (Direct binary stream)
- **Testing**: Vitest for document logic, Playwright for end-to-end download flow.
- **Target Platform**: Vercel (Runtime: Edge or Node.js Serverless)
- **Project Type**: Web feature integration
- **Performance Goals**: Under 5s from click to download (SC-001)
- **Constraints**: 
    - No Supabase Storage involvement.
    - USD only.
    - Max memory for generation: 1024MB.
    - Max execution time: 10s.

## Constitution Check
*GATE: Passed. Re-checked after Phase 1 design.*

- **I. Authentication-First**: ✅ API route (FR-009) verifies session before hydration.
- **II. Data Privacy & Analytics**: ✅ PDF is generated and streamed without persistent file storage.
- **III. Monolithic Architecture**: ✅ Integrated as a standard Route Handler in the `src/app/api` directory.
- **IV. Admin-Configured Pricing**: ✅ Template pulls service names and categories directly from the DB.
- **V. MVP Incremental Development**: ✅ Strictly follows priority #5 (Phase 4).

## Project Structure

### Documentation (this feature)
```text
specs/010-pdf-export/
├── plan.md              # This file
├── research.md          # Server-side @react-pdf/renderer strategy
├── data-model.md        # Calculation record hydration model
├── quickstart.md        # Developer orientation guide
├── contracts/           
│   └── export-pdf.md    # API contract for POST /api/v1/export-pdf
└── tasks.md             # (Not yet generated)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── v1/
│           └── export-pdf/
│               └── route.ts         # PDF generation route handler
├── components/
│   └── wizard/
│       ├── QuoteDocument.tsx        # PDF document layout/styling
│       └── steps/
│           └── ReviewStep.tsx       # Download button + loading state
```

**Structure Decision**: Standard Next.js 14.x monolith layout with API routes for server-side PDF generation. This satisfies the Monolithic Architecture principle.

## Complexity Tracking
> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | [All Prins Met] | |
