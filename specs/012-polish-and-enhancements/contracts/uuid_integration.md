# Interface Contracts: Polish & Enhancements

## API Endpoints

### 1. Calculation Submission
**Endpoint**: `POST /api/calculate` (or current calculation endpoint)

| Field | Type | Description |
|-------|------|-------------|
| `calculation_id` | `UUID` | Client-generated unique ID (Required) |
| `[other_fields]` | `...` | Existing calculation inputs |

**Response**:
`200 OK` on success, `400 Bad Request` on validation failure.

---

### 2. PDF Export
**Endpoint**: `POST /api/export-pdf`

**Payload**:
```json
{
  "calculation_id": "UUID-VALUE",
  "data": {
    "userName": "string",
    "userEmail": "string",
    "items": [],
    "totalPrice": 0,
    "range": { "min": 0, "max": 0 },
    "date": "string"
  }
}
```

**Response**:
`200 OK` (Streamed PDF file).

---

## Client Interactions

### 1. Wizard Persistence Protocol
- **On Step Load**:
  - Check `localStorage` for `becslo_wizard_state`.
  - If exists, compare `updatedAt` to ensure it's <24h old.
  - Prompt user to resume if found.
- **On State Change**:
  - Debounce save to `localStorage` (250ms).
  - Update progress indicator percentage.
