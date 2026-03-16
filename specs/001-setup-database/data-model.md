# Data Model: Setup & Database

## Entities

### User
Represents a user authenticated via Google OAuth.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, REFERENCES auth.users | Unique user identifier |
| email | text | NOT NULL | User's email address |
| name | text | NULLABLE | User's display name from Google |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Account creation timestamp |

**Relationships**: One-to-many with Calculation (user_id)

---

### AdminUser
Represents administrators who can access all data and manage system configuration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique admin identifier |
| email | text | NOT NULL, UNIQUE | Admin's email address |
| role | text | NOT NULL, DEFAULT 'admin' | Admin role (for future RBAC) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Admin creation timestamp |

**Relationships**: None (referenced by auth check)

---

### Service
Represents a service offering that freelancers can include in their calculations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique service identifier |
| name | text | NOT NULL | Service name |
| category | text | NOT NULL | Service category |
| default_hours | numeric | NOT NULL, DEFAULT 1 | Default hours for this service |
| min_hours | numeric | NOT NULL, DEFAULT 1 | Minimum hours allowed |
| max_hours | numeric | NOT NULL | Maximum hours allowed |
| is_active | boolean | NOT NULL, DEFAULT true | Whether service is available |

**Categories**: Software, Subscriptions, Tools, Outsourcing, Travel, Research Incentives, Misc

---

### Calculation
Represents a single pricing calculation performed by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique calculation identifier |
| user_id | uuid | REFERENCES users(id) | User who created this calculation |
| experience_years | text | NOT NULL | Designer experience range (0-2, 3-5, 6-9, 10+) |
| freelance_years | text | NOT NULL | Freelance experience range (0-1, 2-3, 4-6, 7+) |
| designer_country | text | NOT NULL | Designer's country (ISO code) |
| client_country | text | NOT NULL | Client's country (ISO code) |
| pricing_model | text | NOT NULL | 'hourly' or 'fixed' |
| risk_level | text | NOT NULL | Risk level category |
| profit_margin | numeric | NOT NULL | Profit margin percentage |
| total_hours | numeric | NOT NULL | Sum of all service hours |
| final_price | numeric | NOT NULL | Final calculated price (USD) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Calculation timestamp |

**Relationships**: 
- Many-to-one with User (user_id)
- One-to-many with CalculationService (calculation_id)
- One-to-many with Cost (calculation_id)

---

### CalculationService
Junction entity linking calculations to services with custom hour inputs.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| calculation_id | uuid | REFERENCES calculations(id) | Parent calculation |
| service_id | uuid | REFERENCES services(id) | Selected service |
| hours | numeric | NOT NULL | Hours for this service |

**Relationships**:
- Many-to-one with Calculation (calculation_id)
- Many-to-one with Service (service_id)

---

### Cost
Represents overhead costs added to a calculation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| calculation_id | uuid | REFERENCES calculations(id) | Parent calculation |
| name | text | NOT NULL | Cost name |
| amount | numeric | NOT NULL | Cost amount in USD |
| type | text | NOT NULL | 'monthly' or 'project' |

**Cost Types**:
- **monthly**: Recurring costs (software subscriptions)
- **project**: One-time costs (tools, outsourcing)

---

### Configuration
Key-value store for pricing multipliers and system settings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| key | text | PRIMARY KEY | Configuration key |
| value | jsonb | NOT NULL | Configuration value |

**Default Configuration Keys**:

| Key | Default Value |
|-----|---------------|
| base_hourly_rate | 75 (USD) |
| experience_multipliers | {"designer": {"0-2": 0.7, "3-5": 1.0, "6-9": 1.3, "10+": 1.6}, "freelance": {"0-1": 0.8, "2-3": 1.0, "4-6": 1.2, "7+": 1.4}} |
| geo_multipliers | {} (admin populates) |
| risk_buffer | 10 (%) |
| profit_margin | 20 (%) |

---

## Relationships Diagram

```
User (1) ----< (N) Calculation
                        |
                        +----< (N) CalculationService >---- (1) Service
                        |
                        +----< (N) Cost
                        
AdminUser (standalone - auth-based)

Configuration (standalone - key-value)
```

---

## Row Level Security Policies

### users table
- Users can only read their own profile
- Users can only insert their own profile (via auth trigger)

### admin_users table
- Only authenticated users with admin role can read

### services table
- All authenticated users can read active services
- Only admins can insert/update/delete

### calculations table
- Authenticated users can insert their own calculations
- Users can only read their own calculations
- Admins can read all calculations

### calculation_services table
- Same access as parent calculation

### costs table
- Same access as parent calculation

### config table
- All authenticated users can read
- Only admins can update

---

## Validation Rules

1. **experience_years**: Must be one of ['0-2', '3-5', '6-9', '10+']
2. **freelance_years**: Must be one of ['0-1', '2-3', '4-6', '7+']
3. **pricing_model**: Must be either 'hourly' or 'fixed'
4. **risk_level**: Must be one of ['low', 'medium', 'high']
5. **cost.type**: Must be either 'monthly' or 'project'
6. **hours**: Must be >= min_hours and <= max_hours for the service
7. **final_price**: Must be >= 0, rounded to nearest integer
