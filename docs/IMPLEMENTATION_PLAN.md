# Becslo Implementation Plan

**Project:** Freelance Product Design Fee Calculator  
**Goal:** Build a web-based tool for freelancers to calculate project fees, with live previews, PDF export, and admin analytics.  
**Constitution Version:** 1.0.0  
**Plan Version:** 1.0.0  

---

## Constitutional Priority Order

Implementation strictly follows constitution-mandated priority:
1. Authentication flow (email/password only)
2. Basic wizard placeholder (3/4 + 1/4 layout)
3. Service selection
4. Fee calculation engine
5. PDF export
6. Admin analytics
7. Polish & enhancements

---

## Phase 0 — MVP Authentication & Wizard Skeleton

**Objective:** Deliver functional email/password authentication and wizard layout placeholder.

**Tasks:**
1. Initialize NextJS 14.x project with TypeScript & Tailwind CSS
2. Configure Supabase project:
   - Auth: Email/password (ONLY permitted method)
   - Tables: `users`, `admin_users` with RLS
   - Seed initial admin user via SQL migration
3. Implement authentication pages:
   - Signup page with name, email, password
   - Login page with email/password
   - Error handling for failed login attempts
   - Protected route wrapper
4. Post-login redirect:
   - Wizard placeholder page with 3/4 left panel + 1/4 right live preview layout
   - Stub step navigation (7 steps)
   - Live preview placeholder area
5. Implement state management context:
   - Store user authentication state
   - Stub wizard state structure
6. Deploy MVP skeleton to Vercel for live access

**Constitution Compliance:**
- ✅ Email/password only (Constitution I)
- ✅ Authentication before any wizard features (Constitution I, V)

**Deliverables:**
- Login/signup page
- Placeholder wizard with proper layout
- Live preview panel placeholder
- Basic context API structure
- Initial admin user seeded

**Testing:**
- End-to-end authentication flow (required per Constitution)

---

## Phase 1 — Database & Configuration Setup

**Objective:** Prepare all tables and seed data for full calculation flow.

**Tasks:**
1. Finalize database schema:
   - `users` (id, email, name, created_at)
   - `admin_users` (user_id, role, created_at)
   - `services` (id, name, category, default_hours, min_hours, max_hours, is_active, created_at)
   - `categories` (id, name, display_order, created_at)
   - `countries` (id, name, code, multiplier, created_at)
   - `calculations` (id, user_id, user_name, user_email, pricing_model, experience_designer, experience_freelance, designer_country_id, client_country_id, total_hours, subtotal, risk_buffer, profit_margin, final_price, recommended_min, recommended_max, created_at)
   - `calculation_services` (id, calculation_id, service_id, hours, adjusted_rate, cost)
   - `costs` (id, name, is_active, default_cost, created_at)
   - `config` (id, base_rate, risk_buffer_min, risk_buffer_max, profit_margin_min, profit_margin_max, created_at)
2. Seed initial data:
   - Seed initial admin user via SQL migration (Constitution II compliant - stores name/email for analytics)
   - Simplified categories (3-5 broad categories for UI)
   - 120+ services with default/min/max hours across all categories
   - ~200 countries with geography multipliers
   - Default base rates and multipliers
3. Setup RLS policies:
   - User isolation: users can only create calculations (not read others')
   - Admin full access: read/write all tables
4. Implement initial API routes:
   - GET `/api/services` (filtered by category, is_active only)
   - GET `/api/categories`
   - GET `/api/config`
   - GET `/api/countries`
   - GET `/api/costs`

**Constitution Compliance:**
- ✅ User calculations stored for admin analytics (Constitution II)
- ✅ Database schema supports admin-configured pricing (Constitution IV)
- ✅ Email/password authentication integration (Constitution I)
- ✅ Monolithic NextJS + Supabase (Constitution III)

**Deliverables:**
- Database schema fully deployed with migrations
- Seed scripts for all data
- API routes ready for wizard integration
- RLS policies implemented

---

## Phase 2 — Core Pricing Engine

**Objective:** Implement full calculation engine to produce final price based on services, experience, geography, costs, risk, and profit.

**Tasks:**
1. Develop `pricing-engine.ts`:
   - **Inputs:**
     - Selected services with user-input hours
     - Designer experience (Ed): 1-10 scale
     - Freelance experience (Ef): 1-10 scale
     - Designer country (for geography multiplier)
     - Client country (for geography multiplier)
     - Selected costs
     - Risk buffer: 0-50% (fixed range)
     - Profit margin: 10-50% (fixed range)
   - **Calculation Logic:**
     - Experience multiplier: Ed × Ef (range 1-100)
     - Geography multiplier: from country data
     - Adjusted rate per service: base_rate × experience_multiplier × geography_multiplier
     - Base cost: Σ(service_hours × adjusted_rate)
     - Add overhead costs: Σ(selected_costs)
     - Subtotal: base_cost + overhead_costs
     - Risk buffer: subtotal × risk_buffer_percentage
     - Profit margin: (subtotal + risk_buffer) × profit_margin_percentage
     - Final price: subtotal + risk_buffer + profit_margin
     - Round to nearest USD (Constitution requirement)
     - Recommended range: final_price ± 20%
   - **Output:**
     - Full calculation breakdown (services, adjusted rates, costs, multipliers)
     - Final price (USD, rounded)
     - Recommended min/max range
2. Create TypeScript types for input/output
3. Implement server-side validation API: `POST /api/calculate`
4. Integrate with wizard context
5. Add client-side calculation for real-time preview (<100ms)

**Constitution Compliance:**
- ✅ USD currency only (Constitution)
- ✅ Calculation precision: nearest dollar (Constitution)
- ✅ Admin-configurable pricing (Constitution IV)
- ✅ Monolithic implementation (Constitution III)

**Deliverables:**
- Full pricing engine (client + server)
- TypeScript types for calculation inputs/outputs
- API endpoint for server-side calculation
- Real-time preview integration

**Testing:**
- Edge cases: zero hours, max hours, invalid inputs, negative values

---

## Phase 3 — Wizard Flow & Frontend Integration

**Objective:** Complete the 7-step wizard with live preview panel.

**Wizard Steps:**
1. Pricing Model Selection (Hourly vs Project-based)
2. Service Selection (by simplified category, accordion UI)
3. Experience Input (designer: 1-10, freelance: 1-10)
4. Geography Input (designer country, client country dropdowns)
5. Costs Input (checkbox list from config)
6. Risk & Profit Input (sliders: Risk 0-50%, Profit 10-50%)
7. Live Results Review + PDF Export

**Tasks:**
1. Build individual React components per step:
   - Step indicator component
   - Pricing model selector
   - Service accordion with categories
   - Experience sliders with labels
   - Country dropdowns
   - Cost checkboxes
   - Risk/profit sliders
   - Results review component
2. Implement live preview panel (1/4 width, right side):
   - Real-time fee calculation updates <100ms
   - Service breakdown
   - Cost breakdown
   - Multipliers applied
   - Final price display
   - Recommended range display
3. Apply step-level validation:
   - Required fields check
   - Min/max validation for hours and sliders
   - Real-time error messages
4. Hook up wizard state with pricing engine:
   - Context or state management
   - Live calculation on each input change
   - Debounce for API calls if needed
5. Prepare placeholder UI for optional future enhancements (not implemented in MVP)

**Constitution Compliance:**
- ✅ 3/4 wizard + 1/4 live preview layout (Constitution)
- ✅ Real-time accumulation <100ms (Constitution)
- ✅ Manual service hours input only (no templates)
- ✅ USD currency only
- ✅ Email/password authentication required

**Deliverables:**
- Fully functioning 7-step wizard
- Real-time calculation preview panel
- Validation and error handling per step
- Complete wizard state management
- Integration with pricing engine

**Testing:**
- Wizard state transitions validated for each step (required per Constitution)
- Real-time preview updates correctly

---

## Phase 4 — PDF Export

**Objective:** Provide professional client-ready quote with direct download.

**Tasks:**
1. Build React-PDF document component:
   - Include: user info (name, email), services breakdown, hours, costs, pricing breakdown, multipliers, final price, recommended range
   - Professional layout with header/footer
   - USD formatting (nearest dollar)
   - Date and calculation ID
2. Create server-side API endpoint `POST /api/export-pdf`:
   - Generate PDF from React-PDF component
   - Stream PDF directly to browser (no Supabase Storage)
   - Handle errors gracefully
3. Integrate with wizard final step:
   - "Download PDF" button
   - Show loading state during generation
   - Automatic download on successful generation
4. Ensure correct formatting and USD rounding

**Constitution Compliance:**
- ✅ USD currency only
- ✅ Nearest dollar precision
- ✅ Monolithic implementation (NextJS API route)
- ✅ No storage - direct download (user preference)

**Deliverables:**
- React-PDF document component
- Export API route
- Functional download workflow integrated into wizard

---

## Phase 5 — Admin Dashboard & Analytics

**Objective:** Enable admin to manage services, configurations, and inspect calculations with user data.

**Tasks:**
1. Build dashboard layout with navigation:
   - Sidebar navigation
   - Header with admin user info
   - Responsive design
2. Pages:
   - **Analytics** (numeric tables only, no charts in MVP):
     - Average price
     - Average hours
     - Most used services
     - Top client countries
     - Calculation count
     - Date range filters
   - **Services CRUD**:
     - List all services with pagination
     - Activate/deactivate services
     - Edit service details (name, category, hours)
     - Add new services
   - **Config Editor**:
     - Multipliers (experience, geography)
     - Base rates
     - Risk buffer range (min/max)
     - Profit margin range (min/max)
   - **Calculations Viewer**:
     - List all calculations with user data (name, email)
     - View detailed breakdown
     - Date range filters
3. Integrate Supabase API endpoints:
   - GET `/api/admin/analytics`
   - GET/POST/PUT/DELETE `/api/admin/services`
   - GET/PUT `/api/admin/config`
   - GET `/api/admin/calculations`
4. Implement role-based access:
   - Only admin users can access `/admin/*` routes
   - Redirect non-admin users to wizard
   - Middleware for route protection

**Constitution Compliance:**
- ✅ Priority #6 (after PDF export per Constitution V)
- ✅ Admin-configured pricing (Constitution IV)
- ✅ User calculations stored for admin analytics (Constitution II)
- ✅ Stores user name and email for analytics
- ✅ Monolithic NextJS implementation (Constitution III)

**Deliverables:**
- Admin dashboard with all pages
- Fully functional CRUD for services and config
- Calculation inspection view with user data
- Analytics tables with metrics
- Role-based access control

---

## Phase 6 — Polish & Enhancements

**Objective:** Improve UX, validation, error handling, and edge-case coverage.

**Tasks:**
1. **Wizard UX Improvements:**
   - Step progress indicator (visual progress bar)
   - Clear navigation (next/previous, step completion)
   - Smooth transitions between steps
   - Keyboard shortcuts support
2. **Input Validation & Sanitization:**
   - Prevent negative inputs
   - Handle overflow values
   - Sanitize special characters in text fields
   - Real-time validation feedback
   - Clear error messages
3. **Error Handling:**
   - Network errors with retry option
   - Server error messages
   - Graceful degradation
   - Loading states for all async operations
4. **Responsiveness:**
   - Mobile-friendly wizard layout
   - Stack panels on small screens (wizard top, preview below)
   - Touch-friendly controls
   - Optimized PDF for mobile
5. **PDF Layout Refinement:**
   - Professional formatting
   - Consistent typography
   - Page breaks handling
   - Footer with calculation ID
6. **Performance:**
   - Optimize real-time preview (<100ms target)
   - Lazy load large service lists
   - Debounce API calls
7. **Accessibility:**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

**Constitution Compliance:**
- ✅ Real-time accumulation <100ms (Constitution)
- ✅ Monolithic NextJS + Supabase

**Deliverables:**
- Fully polished MVP ready for beta testing
- UX improvements applied across wizard and dashboard
- Comprehensive error handling
- Mobile-responsive design
- Accessibility compliance

---

## Phase 7 — Testing & Deployment Readiness

**Objective:** Comprehensive testing and production deployment.

**Tasks:**
1. **Testing:**
   - Authentication flow end-to-end tests (required per Constitution)
   - Wizard state transitions validation (required per Constitution)
   - Fee calculation edge cases (zero hours, max hours, invalid inputs) (required per Constitution)
   - Admin configuration changes validation against calculations (required per Constitution)
   - Manual testing across all wizard steps
   - PDF generation testing
   - Admin dashboard testing
2. **Deployment:**
   - Configure Vercel environment variables
   - Set up Supabase production project
   - Run Supabase migrations in production
   - Deploy to Vercel preview environment
   - Verify all features work in preview
   - Deploy to production
   - Configure custom domain if needed
3. **Documentation:**
   - Admin user setup guide
   - API documentation
   - Deployment checklist

**Constitution Compliance:**
- ✅ All deployments through Vercel preview before production (Constitution)
- ✅ Database schema changes via Supabase migrations (Constitution)
- ✅ Environment variables via Vercel settings (Constitution)
- ✅ Email/password auth secrets not committed (Constitution)
- ✅ Testing requirements met (Constitution)

**Deliverables:**
- Fully tested MVP
- Production deployment complete
- Admin documentation
- Ready for beta testing

---

## Milestone Timeline (Suggested)

| Phase | Milestone | Duration |
|-------|-----------|----------|
| 0 | Login/Signup MVP & Wizard Skeleton | Week 1 |
| 1 | Database + Configuration Setup | Week 2 |
| 2 | Core Pricing Engine | Week 3 |
| 3 | Wizard Full Flow | Week 4 |
| 4 | PDF Export | Week 5 |
| 5 | Admin Dashboard & Analytics | Week 6 |
| 6 | Polish & Enhancements | Week 7 |
| 7 | Testing & Deployment | Week 8 |

**Total MVP Timeline:** 8 weeks

---

## Technical Specifications

### Service Categories (Simplified for UI)
Original 14 categories consolidated into 3-5 broad categories:
- Strategy & Research
- Design & UI
- Systems & Architecture
- Prototyping & Testing
- Management & Delivery

### Risk & Profit Ranges
- Risk Buffer: 0% to 50% (slider)
- Profit Margin: 10% to 50% (slider)

### Geography Data
- ~200 countries seeded with multipliers
- Multipliers range: 0.5x (low cost) to 2.0x (high cost)
- Admin can adjust multipliers via dashboard

### PDF Generation
- React-PDF for document generation
- Server-side API route
- Direct download/streaming (no Supabase Storage)

### Data Storage
- User calculations stored for admin analytics
- Includes user name and email (per explicit user requirement)
- Admin users seeded via SQL migration
- RLS policies ensure user isolation

---

## Constitution Compliance Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Authentication-First | ✅ Compliant | Email/password only, fully functional before wizard |
| II. Data Privacy & Analytics | ✅ Compliant | Stores user name/email for admin analytics only |
| III. Monolithic Architecture | ✅ Compliant | NextJS 14.x + Supabase + Vercel |
| IV. Admin-Configured Pricing | ✅ Compliant | Full admin dashboard for pricing configuration |
| V. MVP Incremental Development | ✅ Compliant | Strict priority order (0-7) followed |

---

## Post-MVP Opportunities (Phase 8+)

These features are explicitly excluded from initial MVP but can be considered for future iterations:
- Multiple currencies support
- Service templates for common projects
- Hourly rate calculator tool
- AI-based cost recommendation
- Charts for analytics dashboard
- CSV/Excel export
- Enhanced wizard step designs
- Personal calculation save functionality (currently excluded from MVP)
- Enhanced error recovery mechanisms

---

**Plan Version:** 1.0.0  
**Last Updated:** 2026-03-17  
**Constitution Version:** 1.0.0