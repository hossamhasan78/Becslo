# Data Model: Polish & Enhancements

## Client-Side Entities (Local Storage)

### `WizardState`
Key: `becslo_wizard_state`

| Field | Type | Description |
|-------|------|-------------|
| `currentStep` | `number` | 1-7 (wizard progress) |
| `calculation_id` | `string (UUID)` | Unique identifier generated on client |
| `selections` | `object` | Selected services and hours |
| `pricingModel` | `'hourly' | 'project'` | User choice from Step 1 |
| `experience` | `object` | { designer, freelance } values (1-10) |
| `geography` | `object` | { designerCountryId, clientCountryId } |
| `costs` | `number[]` | IDs of selected overhead costs |
| `margins` | `object` | { risk, profit } percentages |
| `updatedAt` | `iso_string` | Timestamp for expiry/stale check |

## PDF Data structure

### `CalculationExport`
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string` | Matches client-side calculation_id |
| `userName` | `string` | Display name of the user |
| `userEmail` | `string` | Contact email |
| `items` | `array` | Breakdown of services, hours, rates |
| `totalPrice` | `number` | Final rounded USD amount |
| `range` | `object` | { min, max } recommended pricing |
| `date` | `string` | Formatted export date |

## Consistency Rules
1. **Uniqueness**: `calculation_id` MUST be generated using `crypto.randomUUID()`.
2. **Synchronization**: On every step change, `WizardState` MUST be saved to Local Storage.
3. **Session Recovery**: On wizard mount, if valid `becslo_wizard_state` exists, user MUST be prompted to resume or start over.
4. **Rounding**: All prices MUST be rounded to the nearest dollar before export/save.
