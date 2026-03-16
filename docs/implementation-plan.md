# Becslo Implementation Plan

## 1. Project Overview

**Project Name:** Becslo  
**Type:** Web Application (Freelance Pricing Calculator)  
**Tech Stack:** NextJS 14.x, TypeScript, Tailwind CSS, Supabase (Auth + PostgreSQL + Storage)

---

## 2. Database Schema (Supabase PostgreSQL)

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Google OAuth users (id, email, name, created_at) |
| `admin_users` | Admin access control (id, email, role, created_at) |
| `services` | Service offerings with categories (id, name, category, default_hours, min_hours, max_hours, is_active) |
| `calculations` | Stored calculations for admin analytics (id, user_id, experience_years, freelance_years, designer_country, client_country, pricing_model, risk_level, profit_margin, total_hours, final_price, created_at) |
| `calculation_services` | Services selected per calculation (id, calculation_id, service_id, hours) |
| `costs` | Costs per calculation (id, calculation_id, name, amount, type) |
| `config` | Pricing multipliers (key, value - JSON) |

---

## 3. Authentication

- **Method:** Supabase Auth with Google OAuth
- **Admin Access:** Same Google OAuth + role check via `admin_users` table
- **Policies:**
  - Authenticated users: can insert calculations
  - Admin users: can read all calculations, manage services, edit config

---

## 4. API Endpoints

### User Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | Fetch all active services (grouped by category) |
| GET | `/api/config` | Fetch pricing multipliers from config table |
| GET | `/api/countries` | Fetch static ISO 3166 country list |
| POST | `/api/calculation` | Store calculation (for admin analytics only) |
| POST | `/api/export-pdf` | Generate PDF and return download URL |

### Admin Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/calculations` | List all calculations with details |
| GET | `/api/admin/analytics` | Numeric stats (avg price, avg hours, top services, top countries) |
| GET | `/api/admin/services` | List all services |
| POST | `/api/admin/services` | Create new service |
| PATCH | `/api/admin/services/:id` | Update service |
| PATCH | `/api/admin/config` | Update multipliers (experience, geo, risk, profit) |

---

## 5. Pricing Formula

### Step 1: Experience Multipliers

**Designer Experience (years):**
| Years | Multiplier |
|-------|------------|
| 0-2 | 0.7 |
| 3-5 | 1.0 |
| 6-9 | 1.3 |
| 10+ | 1.6 |

**Freelance Experience (years):**
| Years | Multiplier |
|-------|------------|
| 0-1 | 0.8 |
| 2-3 | 1.0 |
| 4-6 | 1.2 |
| 7+ | 1.4 |

**Combined:**
```
ExperienceMultiplier = DesignerExpMultiplier × FreelanceExpMultiplier
```

### Step 2: Adjusted Hourly Rate
```
AdjustedHourlyRate = BaseRate × ExperienceMultiplier × GeographyMultiplier
```

### Step 3: Project Cost
```
ProjectCost = Σ(Service Hours × AdjustedHourlyRate)
```

### Step 4: Add Overhead (Costs)
```
ProjectCostWithOverhead = ProjectCost + Σ(OverheadCosts)
```

### Step 5: Final Price
```
FinalPrice = ProjectCostWithOverhead + RiskBuffer + ProfitMargin
FinalPrice = Round to nearest USD
```

---

## 6. Cost Categories (Predefined)

| Category | Examples |
|----------|----------|
| Software | Figma, Adobe CC, Notion (monthly recurring) |
| Subscriptions | Cloud storage, prototyping tools |
| Tools | Tablets, stylus, monitor (one-time) |
| Outsourcing | Contractors, copywriters, illustrators |
| Travel | Client meetings, workshops |
| Research Incentives | Payments to test participants |
| Misc/Other | Stock assets, external API fees |

All costs in USD. Each entry: name, amount, type (monthly/project).

---

## 7. Frontend Pages & Components

### User Pages
| Path | Description |
|------|-------------|
| `/` | Calculator wizard (main app) |

### Admin Pages
| Path | Description |
|------|-------------|
| `/admin` | Dashboard with navigation cards |
| `/admin/analytics` | Numeric stats (no charts for MVP) |
| `/admin/services` | CRUD for services |
| `/admin/config` | Edit multipliers |
| `/admin/calculations` | View stored calculations |

### Wizard Steps (Left Panel - 3/4 width)
1. **Pricing Model** - Select hourly or fixed-price
2. **Service Selection** - Accordion by category, manual hours input
3. **Experience** - Designer years + Freelance years
4. **Geography** - Designer country + Client country (ISO selector)
5. **Costs** - Predefined categories (Software, Subscriptions, Tools, Outsourcing, Travel, Research Incentives, Misc)
6. **Results Preview** - Live calculation breakdown
7. **Export PDF** - Download button

### Right Panel (1/4 width)
- Live calculation preview updating on every step

---

## 8. PDF Export

- Server-side generation using React PDF (@react-pdf/renderer)
- Minimal template: calculation results, inputs, breakdown
- Stored temporarily in Supabase Storage
- Download URL returned to client

---

## 9. Admin Dashboard Features

### Analytics (Numeric only)
- Total users
- Total calculations
- Average project price
- Average total hours
- Most used services
- Top client countries

### Service Management
- CRUD operations
- Activate/deactivate toggle

### Configuration
- Edit experience multipliers (JSON with year ranges)
- Edit geo multipliers (JSON by country/region)
- Edit risk buffer %
- Edit profit margin %
- Edit base hourly rate

### Calculations Viewer
- Table view of all stored calculations
- Expand to see full details (services, costs)

---

## 10. Implementation Phases

### Phase 1: Setup & Database
- Initialize NextJS project
- Set up Supabase project
- Create all database tables
- Set up RLS policies

### Phase 2: Backend API
- Implement all endpoints
- Add calculation storage logic
- Add PDF generation endpoint

### Phase 3: Frontend - Calculator
- Build wizard layout
- Implement each step component
- Build live preview panel
- Integrate API calls

### Phase 4: Frontend - Admin
- Build admin dashboard pages
- Implement service CRUD
- Implement config editor
- Build calculations viewer

### Phase 5: Polish
- Validation improvements
- Error handling
- Loading states
- Edge cases

---

## 11. Default Config Values (Editable via Admin)

| Key | Default Value |
|-----|---------------|
| base_hourly_rate | 75 (USD) |
| experience_multipliers | {"designer": {"0-2": 0.7, "3-5": 1.0, "6-9": 1.3, "10+": 1.6}, "freelance": {"0-1": 0.8, "2-3": 1.0, "4-6": 1.2, "7+": 1.4}} |
| geo_multipliers | {} (admin populates by country) |
| risk_buffer | 10 (%) |
| profit_margin | 20 (%) |

---

## 12. Implementation Status

All phases complete as of 2026-03-16.

| Phase | Status |
|-------|--------|
| Phase 1: Setup & Database | ✅ Complete |
| Phase 2: Backend API | ✅ Complete |
| Phase 3: Frontend Calculator | ✅ Complete |
| Phase 4: Frontend Admin | ✅ Complete |
| Phase 5: Polish | ✅ Complete |
