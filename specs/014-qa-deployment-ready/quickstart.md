# Quickstart: Phase 7 Deployment Setup

## Prerequisites
- [Vercel CLI](https://vercel.com/docs/cli) installed and authenticated.
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed for migrations.
- Access to the Becslo production project on Vercel/Supabase.

## Environment Setup
1. **Supabase Production**:
   - Create a new project for `Production`.
   - Apply all phase-specific migrations: `supabase db push`.
   - Note the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

2. **Vercel Production**:
   - Link your local project: `vercel link`.
   - Configure secrets for the `Production` environment:
     ```bash
     vercel env add NEXT_PUBLIC_SUPABASE_URL production
     vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
     vercel env add SUPABASE_SERVICE_ROLE_KEY production
     ```
   - Deploy: `vercel --prod`.

## Testing Locally
1. Install testing dependencies: `npm install`.
2. Run E2E tests: `npx playwright test`.
3. Run unit tests for engine: `npm run test:unit`.

## Smoke Tests
After production deployment, run the health check suite:
```bash
./scripts/smoke-test.sh https://becslo.vercel.app
```
(Suite will be created in this phase.)
