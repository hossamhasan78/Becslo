# Data Model: Quote Generation

## Entities

### Quote (PDF Document)
- Represents the final output of the calculation.
- **Attributes (Hydrated from DB)**:
    - User (name, email)
    - Calculation ID (UUID)
    - Created At (ISO8601)
    - Pricing Model (Hourly | Project-based)
    - Experience Multipliers (Designer, Freelance)
    - Geography Multipliers (Designer Country, Client Country)
- **Relationships**:
    - **CalculatedServices** (1:n): Service name, Hours, Total Cost.
    - **OverheadCosts** (1:n): Cost name, Value.

## Validation Logic
- **Rounding**: All costs must match the UI (nearest USD).
- **Parity Check**: Before rendering, the generator must re-run the `calculatePrice` engine or fetch the persisted `finalPrice` from DB to ensure integrity.

## Calculation Record (Source)
- Hydrated from:
    - `calculations` table (matches SPEC_FILE: FR-007).
    - `calculation_services` (matches SPEC_FILE: FR-003).
    - `users` (matches SPEC_FILE: FR-002).
