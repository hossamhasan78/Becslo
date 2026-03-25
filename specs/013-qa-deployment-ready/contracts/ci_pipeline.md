# CI/CD Pipeline Contract: Phase 7

## Pipeline Flow

### 1. Pre-Deployment (Staging/Production)
**Action**: Verify database migrations.
**Command**: `npx supabase db push --linked`

### 2. Deployment (Automatic)
**Action**: Vercel branch/production deployment.
**Command**: `vercel deploy --prebuilt` (for CI)

### 3. Smoke Test (Post-Deployment)
**Action**: Execute critical-path E2E tests against the deployed URL.
**Payload**:
```json
{
  "env": "Production",
  "deployment_url": "https://becslo.app",
  "test_suites": ["E2E", "API"]
}
```

### 4. Promotion
**Action**: If smoke tests PASS, promote to Production branch (Merge to `main`).

---

# Quickstart: Testing & Deployment

## Setup
```bash
# Clone the repository
git clone [repo_url]

# Install all workspace dependencies
npm install
```

## Local Development & Testing
```bash
# Run the application locally
npm run dev

# Execute Playwright end-to-end tests
npm test

# Run Vitest unit tests (Watch mode)
npm run test:unit
```

## Production Launch Procedure
1.  **Configure Environment**: Link Vercel project and Supabase instance.
    ```bash
    vercel link
    supabase link --project-ref [ref]
    ```
2.  **Push Migrations**:
    ```bash
    supabase db push
    ```
3.  **Deploy to Production**:
    ```bash
    vercel deploy --prod
    ```
4.  **Verify Status**: Access the production URL and verify wizard functionality.

## Documentation
- **Administrative Guide**: Located at `docs/admin/setup.md`
- **Deployment Checklist**: Located at `docs/admin/deployment-checklist.md`
