# Data Model: Core Pricing Engine

**Feature**: 008-core-pricing-engine
**Date**: 2026-03-18
**Status**: Phase 1 Design

## Overview

This document defines the data model for the Core Pricing Engine feature. The model includes entities for pricing inputs, calculation results, and configuration data. All entities are designed to work with the NextJS 14.x + Supabase monolithic architecture.

---

## Entity Definitions

### 1. PricingInput

**Purpose**: Represents all user-provided inputs required for price calculation

**Fields**:
- `services`: Array of selected services with hours
  - `serviceId`: string (FK to services table)
  - `hours`: number (>= 0)
- `designerExperience`: number (1-10 scale)
- `freelanceExperience`: number (1-10 scale)
- `designerCountryCode`: string (ISO 3166-1 alpha-2)
- `clientCountryCode`: string (ISO 3166-1 alpha-2)
- `selectedCosts`: Array<string> (IDs of selected overhead costs)
- `riskBufferPercent`: number (0-50)
- `profitMarginPercent`: number (10-50)

**Validation Rules**:
- At least one service must be selected
- All hours must be >= 0
- Experience values must be between 1 and 10 (inclusive)
- Country codes must be valid ISO codes from countries table
- Cost IDs must reference existing costs in costs table
- Risk buffer must be between 0% and 50%
- Profit margin must be between 10% and 50%

**State Transitions**: None (immutable input object)

---

### 2. PricingOutput

**Purpose**: Represents the complete calculation result with breakdown

**Fields**:
- `baseCost`: number (sum of service costs)
- `overheadCosts`: number (sum of selected overhead costs)
- `subtotal`: number (baseCost + overheadCosts)
- `riskBufferAmount`: number (calculated from risk buffer percentage)
- `profitMarginAmount`: number (calculated from profit margin percentage)
- `finalPrice`: number (subtotal + riskBufferAmount + profitMarginAmount)
- `recommendedMin`: number (finalPrice × 0.8)
- `recommendedMax`: number (finalPrice × 1.2)
- `breakdown`: Array<ServiceBreakdown>

**ServiceBreakdown** (nested entity):
- `serviceId`: string
- `serviceName`: string
- `hours`: number
- `baseRate`: number (from services table)
- `experienceMultiplier`: number (designerExperience × freelanceExperience)
- `geographyMultiplier`: number (combined multiplier from countries)
- `adjustedRate`: number (baseRate × experienceMultiplier × geographyMultiplier)
- `cost`: number (hours × adjustedRate)

**Validation Rules**:
- All monetary values rounded to nearest dollar
- finalPrice must be >= 0
- recommendedMin < finalPrice < recommendedMax
- breakdown must match input services (same count, same order)

**State Transitions**: None (immutable result object)

---

### 3. Service

**Purpose**: Represents a service with pricing configuration (from database)

**Fields**:
- `id`: string (UUID)
- `name`: string
- `category`: string (FK to categories table)
- `defaultHours`: number (suggested hours, not enforced)
- `minHours`: number (validation lower bound)
- `maxHours`: number (validation upper bound)
- `baseRate`: number (USD per hour, configurable by admin)
- `isActive`: boolean (admin can disable services)
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Validation Rules**:
- Name cannot be empty
- minHours <= defaultHours <= maxHours
- baseRate must be > 0
- isActive cannot be null

**Relationships**:
- Belongs to Category (many-to-one)
- Used in Calculation (many-to-many via calculation_services)

**State Transitions**:
- Active → Inactive (admin action, soft delete)
- Inactive → Active (admin action, restore)

---

### 4. Category

**Purpose**: Groups services for UI organization

**Fields**:
- `id`: string (UUID)
- `name`: string (e.g., "Strategy & Research", "Design & UI")
- `displayOrder`: number (for UI ordering)
- `createdAt`: timestamp

**Validation Rules**:
- Name cannot be empty
- displayOrder must be >= 0

**Relationships**:
- Has many Services (one-to-many)

**State Transitions**: None (immutable for MVP)

---

### 5. Country

**Purpose**: Geographic location with pricing multiplier

**Fields**:
- `id`: string (UUID)
- `name`: string (country name, e.g., "United States")
- `code`: string (ISO 3166-1 alpha-2, e.g., "US", "DE")
- `multiplier`: number (0.5x to 2.0x, configurable by admin)
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Validation Rules**:
- Code must be valid ISO 3166-1 alpha-2 (2 characters)
- Multiplier must be between 0.5 and 2.0
- isActive cannot be null

**Relationships**:
- Used in Calculation (many-to-many, both designer and client country)

**State Transitions**:
- Active → Inactive (admin action)
- Inactive → Active (admin action)

---

### 6. Cost

**Purpose**: Overhead costs that can be optionally included in pricing

**Fields**:
- `id`: string (UUID)
- `name`: string (e.g., "Project Management", "Client Communication")
- `isFixedAmount`: boolean (true = fixed cost, false = percentage-based)
- `defaultCost`: number (USD amount or percentage)
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Validation Rules**:
- Name cannot be empty
- defaultCost must be >= 0
- isActive cannot be null

**Relationships**:
- Used in Calculation (many-to-many via selectedCosts)

**State Transitions**:
- Active → Inactive (admin action)
- Inactive → Active (admin action)

---

### 7. Calculation

**Purpose**: Stores calculation results for admin analytics

**Fields**:
- `id`: string (UUID)
- `userId`: string (FK to users table)
- `userEmail`: string (copied from users for analytics)
- `userName`: string (copied from users for analytics)
- `pricingModel`: string ("hourly" or "project-based")
- `designerExperience`: number
- `freelanceExperience`: number
- `designerCountryId`: string (FK to countries table)
- `clientCountryId`: string (FK to countries table)
- `totalHours`: number (sum of all service hours)
- `subtotal`: number
- `riskBuffer`: number
- `profitMargin`: number
- `finalPrice`: number
- `recommendedMin`: number
- `recommendedMax`: number
- `createdAt`: timestamp

**Validation Rules**:
- userId, userEmail, userName cannot be null
- All numeric fields >= 0
- recommendedMin < finalPrice < recommendedMax

**Relationships**:
- Belongs to User (many-to-one)
- Belongs to Designer Country (many-to-one)
- Belongs to Client Country (many-to-one)
- Has many CalculationServices (one-to-many)

**State Transitions**: None (immutable record)

---

### 8. CalculationService

**Purpose**: Junction table linking calculations to services

**Fields**:
- `id`: string (UUID)
- `calculationId`: string (FK to calculations table)
- `serviceId`: string (FK to services table)
- `hours`: number
- `adjustedRate`: number
- `cost`: number

**Validation Rules**:
- All fields cannot be null
- hours >= 0
- adjustedRate >= 0
- cost >= 0

**Relationships**:
- Belongs to Calculation (many-to-one)
- Belongs to Service (many-to-one)

**State Transitions**: None (immutable record)

---

### 9. Config

**Purpose**: Global pricing configuration (admin-configurable)

**Fields**:
- `id`: string (UUID)
- `baseRate`: number (default hourly rate, USD)
- `riskBufferMin`: number (minimum allowed risk buffer %)
- `riskBufferMax`: number (maximum allowed risk buffer %)
- `profitMarginMin`: number (minimum allowed profit margin %)
- `profitMarginMax`: number (maximum allowed profit margin %)
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Validation Rules**:
- baseRate > 0
- 0 <= riskBufferMin <= riskBufferMax <= 50
- 10 <= profitMarginMin <= profitMarginMax <= 50

**Relationships**: None (singleton config)

**State Transitions**: Admin can update fields via dashboard

---

## Entity Relationships (ER Diagram)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   User      │───────1:N│ Calculation │1:N───────│ Calculation│
│             │         │              │         │   Service  │
└─────────────┘         └──────────────┘         └──────┬──────┘
                               │                           │
                               │                           │
                               N:1                   N:1   │
                               │                           │
┌─────────────┐         ┌──────┴──────┐           ┌───────┴───────┐
│   Country   │1:N──────┤             │           │    Service    │
│ (designer)  │         │   Service   │1:1────────│              │
└─────────────┘         │   Pricing   │           └───────────────┘
                        │   Input     │                   │ N:1
┌─────────────┐         │             │           ┌───────┴───────┐
│   Country   │1:N──────┤             │           │   Category    │
│  (client)   │         └─────────────┘           └───────────────┘
└─────────────┘
         │                           │
         N:1                         │ N:1
         │                           │
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Cost      │1:N──────│ Calculation   │1:1──────│   Config    │
│             │         │   Output     │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Data Access Patterns

### Read Operations

1. **Get All Active Services**: `GET /api/services`
   - Filter by `isActive = true`
   - Order by category, then displayOrder
   - Include category name

2. **Get Single Service**: `GET /api/services/{id}`
   - Return service details with category

3. **Get All Categories**: `GET /api/categories`
   - Order by displayOrder

4. **Get All Countries**: `GET /api/countries`
   - Filter by `isActive = true`
   - Order by name

5. **Get All Costs**: `GET /api/costs`
   - Filter by `isActive = true`
   - Order by name

6. **Get Config**: `GET /api/config`
   - Return single config record

7. **Calculate Price**: `POST /api/calculate`
   - Accept PricingInput
   - Validate inputs
   - Return PricingOutput

### Write Operations

1. **Create Calculation**: (triggered by wizard completion)
   - Insert Calculation record
   - Insert CalculationService records
   - Use RLS to ensure user isolation

2. **Update Config**: (admin only)
   - Update Config record
   - Apply RLS (admin users only)

3. **Update Service**: (admin only)
   - Update Service record
   - Apply RLS (admin users only)

4. **Update Country**: (admin only)
   - Update Country record
   - Apply RLS (admin users only)

5. **Update Cost**: (admin only)
   - Update Cost record
   - Apply RLS (admin users only)

---

## Row-Level Security (RLS) Policies

### Users Table
- Users can read own calculations only
- Admins can read all calculations

### Calculations Table
- Users can insert own calculations only
- Users can read own calculations only
- Admins can read all calculations
- No updates or deletes (immutable records)

### Services/Categories/Countries/Costs/Config Tables
- Public read access (authenticated users)
- Admin write access only
- RLS enforces admin role check

---

## Indexes

### Performance Critical Indexes

1. `calculations_user_id_idx` on `calculations(userId)`
   - Purpose: Fast lookup of user's calculation history
   - Usage: Admin analytics, user profile page

2. `calculations_created_at_idx` on `calculations(createdAt)`
   - Purpose: Time-based filtering for analytics
   - Usage: Date range filters, trends analysis

3. `calculation_services_calculation_id_idx` on `calculation_services(calculationId)`
   - Purpose: Efficient retrieval of services for a calculation
   - Usage: Admin viewing detailed calculation breakdown

4. `services_category_idx` on `services(category)`
   - Purpose: Group services by category in UI
   - Usage: Service selection accordion

5. `services_is_active_idx` on `services(isActive)`
   - Purpose: Filter active services
   - Usage: Service list API

6. `countries_code_idx` on `countries(code)`
   - Purpose: Fast lookup by country code
   - Usage: Pricing calculation (geography multiplier)

7. `countries_is_active_idx` on `countries(isActive)`
   - Purpose: Filter active countries
   - Usage: Country dropdown API

8. `costs_is_active_idx` on `costs(isActive)`
   - Purpose: Filter active costs
   - Usage: Cost selection API

---

## Data Migration Notes

- All tables created via Supabase migrations
- Seed data includes:
  - ~120 services across 5 categories
  - ~200 countries with multipliers (0.5x to 2.0x)
  - Initial overhead costs (5-10 items)
  - Default config values
- Migration versioning tracked in Supabase
- No destructive migrations in production without explicit approval
