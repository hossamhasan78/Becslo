# Quickstart: Backend API

## Overview

This document covers the Backend API implementation for Becslo. The API provides endpoints for fetching pricing configuration, storing calculations, generating PDF exports, and admin management functions.

## API Endpoints Summary

### User Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | Fetch all active services (grouped by category) |
| GET | `/api/config` | Fetch pricing multipliers and base rate |
| GET | `/api/countries` | Fetch ISO 3166 country list |
| POST | `/api/calculation` | Store a pricing calculation |
| POST | `/api/export-pdf` | Generate PDF and return download URL |

### Admin Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/calculations` | List all calculations with details |
| GET | `/api/admin/analytics` | Get aggregate statistics |
| GET | `/api/admin/services` | List all services (incl. inactive) |
| POST | `/api/admin/services` | Create new service |
| PATCH | `/api/admin/services/:id` | Update service |
| PATCH | `/api/admin/config` | Update configuration |

## Verification

### Test User Endpoints

```bash
# Test services endpoint
curl http://localhost:3000/api/services

# Test config endpoint  
curl http://localhost:3000/api/config

# Test countries endpoint
curl http://localhost:3000/api/countries
```

### Test Admin Endpoints

```bash
# Requires admin authentication via Supabase session
curl -H "Authorization: Bearer $SUPABASE_TOKEN" \
  http://localhost:3000/api/admin/analytics
```

### Test Calculation Storage

```bash
curl -X POST http://localhost:3000/api/calculation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_TOKEN" \
  -d '{
    "experience_years": "3-5",
    "freelance_years": "2-3",
    "designer_country": "US",
    "client_country": "GB",
    "pricing_model": "hourly",
    "risk_level": "normal",
    "profit_margin": 20,
    "total_hours": 40,
    "final_price": 3500,
    "services": [],
    "costs": []
  }'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Ensure Supabase session token is included |
| 403 Forbidden | Verify user has admin role in admin_users table |
| Empty services response | Check services table has active records |
| PDF generation fails | Verify @react-pdf/renderer is installed |

## Next Steps

After backend API is verified:
- Phase 3: Frontend - Calculator wizard
- Phase 4: Frontend - Admin dashboard
