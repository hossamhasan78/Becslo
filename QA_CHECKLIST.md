# Manual QA Checklist: PDF Export

## Purpose
Verify that the PDF export feature meets all quality standards and displays correctly in various environments.

## Test Environment
- [ ] Test in Chrome browser (latest version)
- [ ] Test in Safari browser (macOS/iOS)
- [ ] Test in Adobe Acrobat Reader (latest version)
- [ ] Test in Chrome PDF viewer (inline)
- [ ] Test on mobile devices (iOS Safari, Chrome Android)

## SC-002: Calculation ID Verification
- [ ] Generate PDF from wizard
- [ ] Open PDF in PDF viewer
- [ ] Verify Calculation ID matches database record
  - Expected: First 8 characters of calculation UUID
  - Actual: _____________
- [ ] Verify no missing or corrupted characters in ID

## SC-004: Cross-Rendering Verification
### Font Rendering
- [ ] Verify all text is legible (Helvetica font)
- [ ] Check for no invisible text issues
- [ ] Verify special characters render correctly:
  - [ ] Accented characters (é, ñ, ü, etc.)
  - [ ] Cyrillic (if applicable)
  - [ ] Currency symbols ($)

### Layout & Alignment
- [ ] Verify Service Breakdown table columns align correctly
  - [ ] Service name column
  - [ ] Hours column (right-aligned)
  - [ ] Rate column (right-aligned)
  - [ ] Cost column (right-aligned)
- [ ] Verify Overhead Costs are properly spaced
- [ ] Verify Price Summary sections are readable
- [ ] Check for text overflow or clipping
- [ ] Verify page margins are adequate (48px padding)

### Visual Elements
- [ ] Becslo branding displays in header
- [ ] Section titles are clear and distinct
- [ ] Divider lines between sections are visible
- [ ] Footer with generation date and page number visible

## FR-006: Currency Formatting
- [ ] All currency amounts show whole dollars (no decimals)
- [ ] Format matches wizard live preview exactly
- [ ] Verify specific calculations:
  - [ ] Service subtotals: $X (whole dollars)
  - [ ] Risk Buffer: $X (whole dollars)
  - [ ] Profit Margin: $X (whole dollars)
  - [ ] Subtotal: $X (whole dollars)
  - [ ] Recommended Range: $X - $Y (whole dollars)
  - [ ] Total Price: $X (whole dollars, prominent)

## Edge Cases Testing
### Large Service Lists
- [ ] Create calculation with 15-20 services
- [ ] Generate PDF
- [ ] Verify all services display
- [ ] Check for layout issues or overflow
- [ ] Verify performance is still acceptable (<5s)

### Empty or Minimal Data
- [ ] Create calculation with 1 service
- [ ] Generate PDF
- [ ] Verify layout still looks professional
- [ ] Check for alignment issues with sparse data

### Special Characters
- [ ] Test with user name containing special chars: "François Müller"
- [ ] Test with email containing special chars
- [ ] Verify no character corruption or rendering issues

## User Experience Testing
### Download Flow
- [ ] Click "Download PDF" button
- [ ] Verify loading state appears
- [ ] Verify download starts within 5 seconds
- [ ] Verify browser downloads file (not displays inline)
- [ ] Check file naming format: Becslo_Quote_[ID].pdf

### Error Handling
- [ ] Test with expired session (401 error)
- [ ] Verify user-friendly error message
- [ ] Test with invalid calculation ID (404 error)
- [ ] Verify appropriate error message

## Cross-Browser Compatibility
| Browser | Version | Pass/Fail | Notes |
|----------|---------|-------------|---------|
| Chrome | Latest | ☐ | |
| Safari | Latest | ☐ | |
| Firefox | Latest | ☐ | |
| Edge | Latest | ☐ | |

## PDF Viewer Compatibility
| Viewer | Version | Pass/Fail | Notes |
|---------|---------|-------------|---------|
| Adobe Acrobat Reader | Latest | ☐ | |
| Chrome PDF Viewer | Native | ☐ | |
| Safari Preview | Latest | ☐ | |
| Foxit Reader | Latest | ☐ | |

## Known Issues Found
*List any issues discovered during testing:*
-
-
-

## Sign-off
**QA Tester**: _______________________
**Date**: _______________________
**Status**: ☐ PASS / ☐ FAIL (with critical issues) / ☐ FAIL (with minor issues)

## Recommendations for Improvements
*Based on testing results:*
1.
2.
3.
