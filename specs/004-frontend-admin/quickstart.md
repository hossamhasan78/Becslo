# Quickstart: Frontend - Admin

## Overview

Admin dashboard with 4 pages for managing the pricing system.

## Admin Pages

| Path | Purpose |
|------|---------|
| /admin | Dashboard landing |
| /admin/analytics | View numeric statistics |
| /admin/services | CRUD for services |
| /admin/config | Edit pricing configuration |
| /admin/calculations | View stored calculations |

## API Integration

| Endpoint | Purpose |
|----------|---------|
| GET /api/admin/analytics | Fetch aggregate statistics |
| GET /api/admin/services | List all services |
| POST /api/admin/services | Create service |
| PATCH /api/admin/services/:id | Update service |
| GET /api/admin/calculations | List calculations |
| PATCH /api/admin/config | Update configuration |

## Component Structure

```
src/app/admin/
├── page.tsx           # Dashboard landing
├── analytics/
│   └── page.tsx       # Analytics page
├── services/
│   └── page.tsx       # Services CRUD page
├── config/
│   └── page.tsx       # Configuration editor
└── calculations/
    └── page.tsx       # Calculations viewer
```

## Development

```bash
# Start development server
npm run dev

# Navigate to admin
http://localhost:3000/admin
```

## Verification Checklist

- [ ] /admin loads for admin users
- [ ] Non-admin users blocked from /admin routes
- [ ] Analytics shows totals, averages, top items
- [ ] Services can be created, edited, toggled
- [ ] Config values can be updated
- [ ] Calculations table displays all data
- [ ] Expandable calculation details work

## Next Steps

After admin dashboard is complete:
- Phase 5: Polish (validation, error handling, loading states)
