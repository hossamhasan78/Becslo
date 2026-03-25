# Data Model: Testing & Deployment Readiness

## Client-Side Entities (Deployment)

### `TestResult`
*Note: Ephemeral, used in test execution logs only.*

| Field | Type | Description |
|-------|------|-------------|
| `test_suite_id` | `string` | ID of the Playwright test suite (e.g., E2E, Unit) |
| `status` | `enum` | `Pass`, `Fail`, `Error` |
| `duration_ms` | `number` | Execution time in milliseconds |
| `error_log` | `string` | Traceback or failure message |
| `timestamp` | `iso_string`| Execution datetime |

### `DeploymentConfig`
*Note: Secure configuration stored in Vercel/Supabase environment settings.*

| Field | Type | Description |
|-------|------|-------------|
| `env` | `enum` | `Staging`, `Production` |
| `vercel_project_id`| `string` | Target Vercel application ID |
| `supabase_url` | `string (secret)` | Production/Staging database URL |
| `supabase_anon_key`| `string (secret)` | Public anonymous API key |
| `custom_domain` | `string` | Production custom URL (e.g., becslo.app) |

## Consistency Rules

1. **Pre-deployment Migration**: A deployment MUST NOT trigger until all database migrations have successfully executed and verified against the target schema.
2. **Preview Verification**: Production deployment MUST NOT proceed until the automated test suite has passed on the Vercel Preview/Preview Branch URL.
3. **Environment Isolation**: Production secrets MUST be strictly isolated from Staging/Dev environments to prevent accidental data contamination.
4. **Health Check**: Every deployment MUST include a post-deploy health check (HTTP 200) for the production homepage and at least one pricing API endpoint.
