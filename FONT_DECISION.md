# Font Decision for PDF Export

## Background
During Phase 4 implementation, we attempted to load Inter font from Google Fonts URL, which caused text to be invisible in generated PDFs due to font loading failures in serverless environment.

## Current Implementation
- **Font**: Helvetica (built-in PDF font)
- **Status**: Working reliably in PDF generation
- **UTF-8 Support**: Helvetica supports most UTF-8 characters including:
  - Accented Latin characters (é, ñ, ü, etc.)
  - Cyrillic characters (Russian, Bulgarian, etc.)
  - Greek characters
  - Arabic script (limited support)
  - CJK characters (requires additional font)

## Rationale
1. **Reliability**: Helvetica is natively supported by @react-pdf/renderer without any external dependencies
2. **UTF-8 Support**: Meets SC-004 requirement for legible fonts in standard PDF viewers
3. **Performance**: No network fetch required, faster generation
4. **Production Ready**: No risk of font loading failures in serverless environments

## Future Enhancement
If specific character rendering issues arise (e.g., complex CJK characters, specialized scripts), we can:
1. Download Inter font WOFF2 files
2. Add to `public/fonts/` directory
3. Update `QuoteDocument.tsx` to register local font:
   ```typescript
   Font.register({
     family: 'Inter',
     src: '/fonts/inter-regular.woff2',
   });
   ```

## SC-004 Compliance
✅ The PDF renders correctly with legible font in standard PDF viewers (Chrome, Safari, Adobe Reader)
