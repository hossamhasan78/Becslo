# Research: PDF Export Implementation

## Unknowns & Decisions

### Decision 1: Server-side PDF Generation with @react-pdf/renderer
- **Decision**: Use `@react-pdf/renderer` within a Next.js Route Handler (`src/app/api/export-pdf/route.ts`).
- **Rationale**: 
    - Consistent layout regardless of the user's browser/viewport.
    - Security: Calculation data is verified on the server before rendering.
    - Performance: Decouples rendering from the main UI thread.
- **Alternatives considered**: 
    - `jspdf` / `html2canvas` (Client-side): Rejected due to inconsistent quality and difficulty handling multi-page layouts.
    - `puppeteer` (Server-side): Rejected due to high memory overhead and cold start times on Vercel.

### Decision 2: Streaming vs. Buffer for Serverless
- **Decision**: Generate the PDF as a buffer/stream and return it with `Content-Type: application/pdf` and `Content-Disposition: attachment`.
- **Rationale**: Vercel serverless functions have a 4.5MB payload limit (or higher for some plans), which is sufficient for a standard text-based quote. Streaming ensures the browser starts the download as soon as possible.
- **Implementation**:
    ```typescript
    const stream = await renderToStream(<MyDocument data={data} />);
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${data.id}.pdf"`,
      },
    });
    ```

### Decision 3: Font Loading in Serverless
- **Decision**: Use standard built-in PDF fonts (Helvetica, Times-Roman) or embed a single lightweight Google Font (e.g., Inter) hosted locally in `public/fonts`.
- **Rationale**: `react-pdf` requires fonts to be registered. External URL loading can be flaky in serverless environments. Local hosting ensures availability.

## Best Practices
- **Layout**: Use `Flexbox` which is natively supported by `react-pdf`. Avoid complex CSS properties not supported by the library.
- **Versioning**: Include a version marker or timestamp in the PDF footer to track when the logic was applied.
- **Rounding**: Double-check that `Math.round()` is applied to the final result before passing to the PDF component to match UI.
