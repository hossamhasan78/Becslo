# Production Deployment Checklist

**Purpose**: Step-by-step guide for deploying Becslo to production environment  
**Last Updated**: 2026-03-24  
**Feature**: Phase 7 - Testing & Deployment Readiness

---

## Prerequisites Verification

### Access & Tools
- [ ] Vercel CLI installed and authenticated (`vercel --version`)
- [ ] Supabase CLI installed and authenticated (`supabase --version`)
- [ ] Git access to Becslo repository
- [ ] Access to Vercel production project
- [ ] Access to Supabase production project

### Environment Files
- [ ] `.env.local` file exists with all required variables
- [ ] All environment variables documented in `.env.example` (if exists)
- [ ] No secrets committed to git repository

---

## Phase 1: Database Preparation

### 1.1 Database Backup (CRITICAL - Before Migrations)
- [ ] **BACKUP**: Create backup of current Supabase database (if data exists)
  ```bash
  # Via Supabase Dashboard:
  # 1. Navigate to Database > Backups
  # 2. Create manual backup
  # 3. Note backup timestamp for rollback reference
  ```

### 1.2 Supabase Production Setup
- [ ] Create/verify Supabase production project
- [ ] Record Supabase Production URL
- [ ] Generate/record Supabase Service Role Key (save securely)
- [ ] Generate/record Supabase Anonymous Key (public)

### 1.3 Database Migrations
- [ ] Review all pending migrations in `supabase/migrations/`
- [ ] Run migrations against production:
  ```bash
  supabase db push --db-url "postgresql://..."
  ```
- [ ] Verify all tables created successfully
- [ ] Verify RLS policies applied correctly
- [ ] Verify seed data populated:
  - [ ] Admin user(s) seeded
  - [ ] Services seeded (120+)
  - [ ] Countries seeded (~200)
  - [ ] Categories seeded (3-5)
  - [ ] Costs seeded
  - [ ] Config defaults set

---

## Phase 2: Vercel Configuration

### 2.1 Project Linking
- [ ] Link repository to Vercel (if not already):
  ```bash
  vercel link
  ```
- [ ] Verify project name and scope

### 2.2 Environment Variables (Production)
Set the following environment variables in Vercel Production environment:

#### Required Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase production URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)

#### Optional Variables (if used)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (e.g., https://becslo.vercel.app)
- [ ] Any additional app-specific variables

### 2.3 Environment Variables (Preview)
- [ ] Verify preview environment variables match production structure
- [ ] Test preview environment variables are correctly configured

### 2.4 Build Configuration
- [ ] Verify build command: `npm run build`
- [ ] Verify output directory: `.next`
- [ ] Verify Node.js version compatibility
- [ ] Check `next.config.js` for any production-specific settings

---

## Phase 3: Pre-Deployment Testing

### 3.1 Local Testing
- [ ] Run all unit tests: `npm run test:run`
- [ ] Run all E2E tests: `npx playwright test`
- [ ] Verify no test failures
- [ ] Check test coverage meets requirements

### 3.2 Build Verification
- [ ] Run production build locally: `npm run build`
- [ ] Verify build completes without errors
- [ ] Run `npm start` to test production build locally
- [ ] Verify all features work in production build

### 3.3 Code Quality
- [ ] Run lint: `npm run lint`
- [ ] Fix any lint warnings/errors
- [ ] Run TypeScript type check (if configured)
- [ ] Review and address any console errors in development

---

## Phase 4: Deployment

### 4.1 Preview Deployment
- [ ] Push changes to GitHub (feature branch)
- [ ] Wait for Vercel preview deployment
- [ ] Note preview URL
- [ ] Run smoke tests against preview environment:
  ```bash
  ./scripts/smoke-test.sh <preview-url>
  ```
- [ ] Manual verification of preview:
  - [ ] Authentication flow works
  - [ ] Wizard loads and transitions work
  - [ ] Calculations produce correct results
  - [ ] PDF generation works
  - [ ] Admin dashboard accessible (if applicable)
  - [ ] No console errors in browser
- [ ] Address any issues found in preview

### 4.2 Production Deployment
- [ ] Merge feature branch to `main` (or production branch)
- [ ] Wait for Vercel production deployment
- [ ] Note production deployment timestamp
- [ ] Verify deployment completed successfully

---

## Phase 5: Post-Deployment Verification

### 5.1 Smoke Tests
- [ ] Run smoke test script against production:
  ```bash
  ./scripts/smoke-test.sh https://becslo.vercel.app
  ```
- [ ] Verify smoke tests pass (exit code 0)
- [ ] Review `smoke-test-results.json` if generated

### 5.2 Health Check
- [ ] Test internal health endpoint: `GET /api/health`
- [ ] Verify response: `{ status: 'healthy', checks: { server: 'ok', database: 'ok' } }`
- [ ] Verify response time < 1000ms

### 5.3 Manual Testing Checklist
- [ ] **Authentication**:
  - [ ] Sign up with new account works
  - [ ] Login with existing account works
  - [ ] Logout works
  - [ ] Protected routes redirect to login

- [ ] **Wizard Flow**:
  - [ ] Step 1 (Pricing Model): Select model, validation works
  - [ ] Step 2 (Services): Select services, update hours
  - [ ] Step 3 (Experience): Set experience values
  - [ ] Step 4 (Geography): Select countries
  - [ ] Step 5 (Costs): Select overhead costs
  - [ ] Step 6 (Risk/Profit): Adjust sliders
  - [ ] Step 7 (Results): View final calculation
  - [ ] Live preview updates correctly (< 100ms)
  - [ ] Navigation (next/previous/back) works

- [ ] **Calculations**:
  - [ ] Base price calculation correct
  - [ ] Experience multipliers applied
  - [ ] Geography multipliers applied
  - [ ] Risk buffer calculated
  - [ ] Profit margin calculated
  - [ ] Final price rounded to USD
  - [ ] Recommended range displayed correctly

- [ ] **PDF Export**:
  - [ ] PDF generation succeeds
  - [ ] PDF downloads automatically
  - [ ] PDF content matches calculation
  - [ ] PDF formatting correct

- [ ] **Admin Dashboard** (if accessible):
  - [ ] Analytics page loads
  - [ ] Services CRUD works
  - [ ] Config editor works
  - [ ] Calculations viewer displays data

### 5.4 Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if possible)
- [ ] Test in Edge (if possible)
- [ ] Test mobile responsive design

---

## Phase 6: Rollback Plan

### Pre-Deployment Rollback Preparation
- [ ] Document current production commit SHA
- [ ] Test rollback process in preview environment
- [ ] Verify Vercel can redeploy previous commit

### Rollback Procedure (if issues found)
- [ ] Stop any traffic if critical (Vercel dashboard > Domains > Pause)
- [ ] Revert to previous commit: `git revert HEAD` or checkout previous commit
- [ ] Push to production branch
- [ ] Wait for Vercel deployment
- [ ] Verify rollback successful
- [ ] Run smoke tests
- [ ] Communicate rollback to stakeholders

---

## Phase 7: Monitoring & Logging

### 7.1 Vercel Monitoring
- [ ] Enable Vercel Analytics (if desired)
- [ ] Check Vercel deployment logs
- [ ] Set up error tracking (e.g., Sentry) if configured

### 7.2 Supabase Monitoring
- [ ] Enable Supabase logs
- [ ] Monitor database performance
- [ ] Set up alerts for critical errors

---

## Phase 8: Documentation & Handoff

### 8.1 Update Documentation
- [ ] Update deployment timestamp in this checklist
- [ ] Document any issues encountered and resolutions
- [ ] Update environment variables documentation
- [ ] Update API documentation if changes made

### 8.2 Admin Documentation
- [ ] Create/update admin user setup guide
- [ ] Document admin dashboard procedures
- [ ] Provide admin login credentials securely

---

## Phase 9: Security Review

### 9.1 Security Checklist
- [ ] No secrets in environment variables (only API keys)
- [ ] RLS policies verified on Supabase
- [ ] Admin routes properly protected
- [ ] Rate limiting configured (if applicable)
- [ ] HTTPS enforced
- [ ] CORS properly configured

### 9.2 Access Control
- [ ] Admin user accounts created and tested
- [ ] Admin credentials stored securely
- [ ] Regular user access verified
- [ ] No unauthorized admin access

---

## Completion Sign-off

**Deployment Completed**: _____________________ (Date)

**Deployed By**: _____________________ (Name)

**Verified By**: _____________________ (Name)

**Production URL**: https://becslo.vercel.app

**Production Commit SHA**: _____________________

---

## Quick Reference Commands

### Vercel Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View environment variables
vercel env ls
```

### Supabase Commands
```bash
# Push migrations
supabase db push

# Generate types
supabase gen types typescript --linked > types/supabase.ts

# Check database status
supabase status
```

### Testing Commands
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:run

# Run E2E tests
npx playwright test

# Run smoke test
./scripts/smoke-test.sh <url>
```

---

## Issues & Resolutions Log

| Issue | Date | Resolution | Resolved By |
|-------|------|------------|------------|
|       |      |            |            |

---

## Notes

- Always perform database backup before migrations
- Test in preview environment before production
- Keep rollback plan ready at all times
- Document any deviations from this checklist
- This checklist should be updated as the project evolves

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-03-24  
**Related Docs**: 
- `quickstart.md` - Quick start guide
- `admin-guide.md` - Admin user setup
- `api-documentation.md` - API documentation