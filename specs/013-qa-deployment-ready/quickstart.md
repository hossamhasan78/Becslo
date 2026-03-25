# Quickstart: Testing & Deployment Readiness (Phase 7)

## 0. Prerequisites
- **Node.js** v18+ 
- **Supabase CLI** installed and linked to project.
- **Vercel CLI** installed and linked to project.
- **Playwright** installed for E2E tests.

## 1. Setup & Local Testing
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run local end-to-end tests (Playwright)
npx playwright test
```

## 2. Pre-Deployment (Staged Launch)
1.  **Run Migrations**: Sync the Supabase schema to the target instance.
    ```bash
    supabase db push --linked
    ```
2.  **Deploy Preview**: Create a staging deployment on Vercel.
    ```bash
    vercel deploy
    ```
3.  **Run Smoke Tests**: Execute a targeted test suite against the preview URL.
    ```bash
    npx playwright test --config playwright.config.ts --project=chromium --base-url=[PREVIEW_URL]
    ```

## 3. Production Deployment (Final)
1.  **Merge to Main**: Trigger production deployment via Vercel GitHub integration OR manually:
    ```bash
    vercel deploy --prod
    ```
2.  **Health Check**: Access the production URL (`becslo.app` or similar) and verify wizard state transitions.

## 4. Documentation
- **Deployment Summary**: `docs/deployment/launch-notes.md`
- **Admin Setup**: `docs/admin/setup.md`
- **QA Report**: `docs/qa/final-test-results.md`
