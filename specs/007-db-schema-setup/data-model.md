# Data Model: Database & Configuration Setup

**Feature**: Database & Configuration Setup
**Date**: 2026-03-18
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data model for Becslo pricing calculator, including services, categories, countries, calculations, and system configuration. The model supports admin-configured pricing and user data isolation via Row-Level Security (RLS).

---

## Entity Definitions

### 1. Service

**Description**: Represents a design service option that users can select in the wizard. Each service has default hours and configurable min/max ranges.

**Table**: `public.services`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing identifier |
| `category_id` | `integer` | FOREIGN KEY to `categories(id)`, NOT NULL | Reference to service category |
| `name` | `text` | NOT NULL | Service name (e.g., "Logo Design") |
| `default_hours` | `numeric(5,2)` | NOT NULL, DEFAULT 1 | Default hours for this service |
| `min_hours` | `numeric(5,2)` | NOT NULL, DEFAULT 1 | Minimum hours allowed |
| `max_hours` | `numeric(5,2)` | NOT NULL, DEFAULT 100 | Maximum hours allowed |
| `is_active` | `boolean` | NOT NULL, DEFAULT true | Whether service is available |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp of service creation |

**Relationships**:
- Many-to-one with `categories` (via `category_id`)
- One-to-many with `calculation_services` (via `service_id`)

**Validation Rules**:
- `min_hours` must be <= `max_hours`
- `default_hours` must be between `min_hours` and `max_hours`

---

### 2. Category

**Description**: Represents a grouping of related services for UI display.

**Table**: `public.categories`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing identifier |
| `name` | `text` | NOT NULL, UNIQUE | Category name (e.g., "Design & UI") |
| `display_order` | `integer` | NOT NULL, DEFAULT 0 | Order for UI display |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp of category creation |

**Relationships**:
- One-to-many with `services` (via `category_id`)

**Validation Rules**:
- `display_order` must be >= 0

---

### 3. Country

**Description**: Represents a country with geography multiplier for pricing calculations.

**Table**: `public.countries`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing identifier |
| `name` | `text` | NOT NULL, UNIQUE | Country name |
| `code` | `char(2)` | NOT NULL, UNIQUE | ISO country code (e.g., "US") |
| `multiplier` | `numeric(3,2)` | NOT NULL, DEFAULT 1.0 | Geography multiplier (0.5-2.0) |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp |

**Validation Rules**:
- `multiplier` must be between 0.5 and 2.0
- `code` must be valid ISO 3166-1 alpha-2

---

### 4. Calculation

**Description**: Represents a user's complete pricing calculation with all inputs and computed outputs.

**Table**: `public.calculations`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Auto-generated UUID |
| `user_id` | `uuid` | FOREIGN KEY to `auth.users(id)`, NOT NULL | User who created calculation |
| `user_name` | `text` | NOT NULL | User's name at time of calculation |
| `user_email` | `text` | NOT NULL | User's email at time of calculation |
| `pricing_model` | `text` | NOT NULL | 'hourly' or 'project' |
| `experience_designer` | `integer` | NOT NULL | Designer experience level (1-10) |
| `experience_freelance` | `integer` | NOT NULL | Freelance experience level (1-10) |
| `designer_country_id` | `integer` | FOREIGN KEY to `countries(id)` | Designer's country |
| `client_country_id` | `integer` | FOREIGN KEY to `countries(id)` | Client's country |
| `total_hours` | `numeric(10,2)` | NOT NULL | Sum of all service hours |
| `subtotal` | `numeric(12,2)` | NOT NULL | Base cost before risk/profit |
| `risk_buffer` | `numeric(12,2)` | NOT NULL | Risk buffer amount |
| `profit_margin` | `numeric(12,2)` | NOT NULL | Profit margin amount |
| `final_price` | `numeric(12,2)` | NOT NULL | Final calculated price (USD) |
| `recommended_min` | `numeric(12,2)` | NOT NULL | Recommended minimum price |
| `recommended_max` | `numeric(12,2)` | NOT NULL | Recommended maximum price |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp |

**Relationships**:
- Many-to-one with `auth.users` (via `user_id`)
- Many-to-one with `countries` (via `designer_country_id`, `client_country_id`)
- One-to-many with `calculation_services` (via `calculation_id`)

**Validation Rules**:
- Experience levels must be 1-10
- All monetary values must be >= 0
- `recommended_min` must be < `recommended_max`

**Privacy Note**: User name and email stored for admin analytics (Constitution II).

---

### 5. Calculation Service

**Description**: Represents a service line item within a calculation.

**Table**: `public.calculation_services`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Auto-generated UUID |
| `calculation_id` | `uuid` | FOREIGN KEY to `calculations(id)`, NOT NULL | Parent calculation |
| `service_id` | `integer` | FOREIGN KEY to `services(id)`, NOT NULL | Service selected |
| `hours` | `numeric(5,2)` | NOT NULL | Hours for this service |
| `adjusted_rate` | `numeric(10,2)` | NOT NULL | Rate after multipliers applied |
| `cost` | `numeric(10,2)` | NOT NULL | Total cost (hours × adjusted_rate) |

**Relationships**:
- Many-to-one with `calculations` (via `calculation_id`)
- Many-to-one with `services` (via `service_id`)

---

### 6. Cost

**Description**: Represents optional overhead costs that can be added to calculations.

**Table**: `public.costs`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing identifier |
| `name` | `text` | NOT NULL | Cost name (e.g., "Software Licenses") |
| `is_active` | `boolean` | NOT NULL, DEFAULT true | Whether cost is available |
| `default_cost` | `numeric(10,2)` | NOT NULL, DEFAULT 0 | Default cost value |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp |

**Validation Rules**:
- `default_cost` must be >= 0

---

### 7. Config

**Description**: System-wide configuration for pricing calculations.

**Table**: `public.config`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Always 1 (singleton) |
| `base_rate` | `numeric(10,2)` | NOT NULL, DEFAULT 50 | Base hourly rate (USD) |
| `risk_buffer_min` | `numeric(5,2)` | NOT NULL, DEFAULT 0 | Minimum risk buffer % |
| `risk_buffer_max` | `numeric(5,2)` | NOT NULL, DEFAULT 50 | Maximum risk buffer % |
| `profit_margin_min` | `numeric(5,2)` | NOT NULL, DEFAULT 10 | Minimum profit margin % |
| `profit_margin_max` | `numeric(5,2)` | NOT NULL, DEFAULT 50 | Maximum profit margin % |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp |
| `updated_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Last update timestamp |

**Validation Rules**:
- All percentage fields must be 0-100
- Min must be <= Max for each range

---

## Row-Level Security (RLS)

### Policies

| Table | User Policy | Admin Policy |
|-------|-------------|---------------|
| `services` | SELECT (is_active=true) | Full access |
| `categories` | SELECT | Full access |
| `countries` | SELECT | Full access |
| `calculations` | SELECT (user_id=auth.uid()) | Full access |
| `calculation_services` | SELECT via calculations | Full access |
| `costs` | SELECT (is_active=true) | Full access |
| `config` | SELECT | Full access |

**RLS Note**: Users can only see their own calculations. Admin users have full access via service role check.

---

## Seed Data Requirements

| Entity | Minimum Count | Notes |
|--------|---------------|-------|
| Categories | 3-5 | Broad groupings (Strategy, Design, etc.) |
| Services | 120+ | Distributed across categories |
| Countries | ~200 | All countries with multipliers |
| Config | 1 | Singleton record |

---

## Constitutional Compliance

| Principle | Implementation |
|-----------|---------------|
| II. Data Privacy | User name/email stored in calculations for admin analytics only |
| IV. Admin Pricing | Config table, service definitions, country multipliers all admin-configurable |
| USD Only | All monetary fields in USD, no currency conversion |
| Nearest Dollar | final_price rounded to nearest integer |
