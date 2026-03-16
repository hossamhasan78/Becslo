# Quickstart: Setup & Database

## Prerequisites

- Node.js 18+
- Supabase CLI (optional, for local development)
- Google Cloud OAuth credentials (for authentication)

## Quick Start

### 1. Initialize NextJS Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase

1. Create a new Supabase project at supabase.com
2. Run the database migrations in `supabase/migrations/`
3. Configure Google OAuth in Supabase Authentication settings

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to verify the app loads.

---

## Database Setup

### Running Migrations

Using Supabase CLI:
```bash
supabase db push
```

Or paste the SQL from `supabase/migrations/` into the Supabase SQL editor.

### Seeding Data

Run seed script to populate default services and configuration:
```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

---

## Verification

After setup, verify:

1. **NextJS runs**: `npm run dev` starts without errors
2. **Build succeeds**: `npm run build` completes successfully
3. **Database connected**: Query the `config` table returns default values
4. **Services available**: Query the `services` table returns default offerings
5. **RLS active**: Unauthorized queries are blocked

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "NEXT_PUBLIC_SUPABASE_URL is missing" | Add environment variables to .env.local |
| Build fails with TypeScript errors | Run `npm install` to get latest dependencies |
| Database connection fails | Verify Supabase project is active |
| RLS blocking operations | Check auth context is properly set |

---

## Next Steps

After completing this setup phase, proceed to:
- Phase 2: Backend API Implementation
- Phase 3: Frontend - Calculator
- Phase 4: Frontend - Admin
