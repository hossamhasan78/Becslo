# Contract: Post-Deployment Smoke Test Script

## Interface Purpose
Provides an automated health signal after each deployment to verify that the application is "up" and can communicate with its primary data services.

## Interface Usage
```bash
./scripts/smoke-test.sh <TARGET_URL>
```

### Input Parameters
- **TARGET_URL**: The root URL of the environment to test (e.g., `https://becslo.vercel.app` or `https://becslo-git-preview.vercel.app`).
- **SUPABASE_PUBLIC_ANON_KEY** (Env Var): Required to verify API accessibility.

### Contract Format
The script MUST output the results of the following checks to `STDOUT`:

| Check | Success Criteria |
| :--- | :--- |
| **HTTP Status** | `200 OK` for the root URL. |
| **Login Page** | `GET /login` returns non-empty HTML. |
| **Supabase Health** | Verification that the `/api/health` (to be created) can fetch a simple record from the `services` table. |

### Exit Codes
- **0**: All health checks passed.
- **1**: Connectivity error or HTTP failure.
- **2**: Data/API failure (Supabase unreachable).

### Output Artifact
The script MUST generate a `smoke-test-results.json` file following the **Test Report** entity structure defined in `data-model.md`.
