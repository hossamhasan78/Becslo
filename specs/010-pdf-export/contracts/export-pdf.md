# API Contract: PDF Export

## Endpoint: POST /api/v1/export-pdf

**Description**: Generates and streams a professional PDF quote for the specified calculation.

**Auth Required**: YES (Session Cookie)

### Request
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | YES | The calculation ID (Must be owned by the authenticated user) |

**Example Body**:
```json
{
  "id": "771e868a-494d-b7e5-298fadb9109c"
}
```

### Response
| Status | Body | Description |
|--------|------|-------------|
| `200` | Binary Stream | `Content-Type: application/pdf` |
| `401` | Error Object | `{ "error": "Not authenticated" }` |
| `404` | Error Object | `{ "error": "Calculation not found" }` |
| `500` | Error Object | `{ "error": "Internal PDF generation failure" }` |

**Headers**:
- `Content-Type`: `application/pdf`
- `Content-Disposition`: `attachment; filename="quote-[CalculationID].pdf"`

### Client-side Fetch Example (Wizard UI)
```javascript
const response = await fetch('/api/v1/export-pdf', {
  method: 'POST',
  body: JSON.stringify({ id: state.savedCalculationId })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `quote-${id}.pdf`;
a.click();
```
