# Data Model: Database Service Cleanup

**Branch**: `016-db-service-cleanup`
**Date**: 2026-03-26

---

## Schema Changes

**No schema changes.** This feature performs row-level deletions only. No columns are added, removed, or altered. No new tables are created.

---

## Categories Table — Before / After

### Before (4 categories)

| id | name | display_order |
|----|------|---------------|
| 1 | Strategy & Research | 1 |
| 2 | Design & UI/UX | 2 |
| 3 | **Development** ❌ DELETE | 3 |
| 4 | **Marketing & Launch** ❌ DELETE | 4 |

### After (2 categories)

| id | name | display_order |
|----|------|---------------|
| 1 | Strategy & Research | 1 |
| 2 | Design & UI/UX | 2 |

---

## Services Table — Before / After

### Strategy & Research (category_id = 1) — 4 deleted, 16 survive

| name | Action |
|------|--------|
| Brand Strategy | ✅ Keep |
| Market Research | ✅ Keep |
| Competitor Analysis | ✅ Keep |
| User Research | ✅ Keep |
| **Product Positioning** | ❌ DELETE |
| Value Proposition Development | ✅ Keep |
| Customer Persona Creation | ✅ Keep |
| User Journey Mapping | ✅ Keep |
| Information Architecture | ✅ Keep |
| Content Strategy | ✅ Keep |
| SEO Strategy | ✅ Keep |
| Analytics Setup | ✅ Keep |
| Product Roadmap Planning | ✅ Keep |
| Feature Prioritization | ✅ Keep |
| Usability Testing Plan | ✅ Keep |
| Accessibility Audit | ✅ Keep |
| Brand Voice & Tone | ✅ Keep |
| **Messaging Framework** | ❌ DELETE |
| **Industry Trends Analysis** | ❌ DELETE |
| **Pricing Strategy** | ❌ DELETE |

### Design & UI/UX (category_id = 2) — 15 deleted, 18 survive

| name | Action |
|------|--------|
| **Logo Design** | ❌ DELETE |
| **Brand Identity Design** | ❌ DELETE |
| **Color Palette Creation** | ❌ DELETE |
| **Typography Selection** | ❌ DELETE |
| Icon Set Design | ✅ Keep |
| UI Design - Web | ✅ Keep |
| UI Design - Mobile | ✅ Keep |
| UX Design - Wireframes | ✅ Keep |
| UX Design - Prototyping | ✅ Keep |
| Design System Creation | ✅ Keep |
| Component Library | ✅ Keep |
| **Landing Page Design** | ❌ DELETE |
| Dashboard Design | ✅ Keep |
| **E-commerce Design** | ❌ DELETE |
| App Screen Design | ✅ Keep |
| Illustration Design | ✅ Keep |
| Photo Editing | ✅ Keep |
| **Banner & Ad Design** | ❌ DELETE |
| **Social Media Graphics** | ❌ DELETE |
| Presentation Design | ✅ Keep |
| **Print Design** | ❌ DELETE |
| **Packaging Design** | ❌ DELETE |
| **Motion Graphics** | ❌ DELETE |
| Animation | ✅ Keep |
| **Video Editing** | ❌ DELETE |
| 3D Modeling | ✅ Keep |
| Icon Animation | ✅ Keep |
| User Onboarding Design | ✅ Keep |
| **Empty State Design** | ❌ DELETE |
| **Error State Design** | ❌ DELETE |
| **Loading State Design** | ❌ DELETE |
| Accessibility Design Review | ✅ Keep |
| Design Handoff | ✅ Keep |

### Development (category_id = 3) — ALL DELETED via category CASCADE

All ~40 services in this category are deleted when the category row is deleted (FK: `ON DELETE CASCADE`).

### Marketing & Launch (category_id = 4) — ALL DELETED via category CASCADE

All ~30 services in this category are deleted when the category row is deleted (FK: `ON DELETE CASCADE`).

---

## calculation_services Table — Defensive Cleanup

No schema change. The migration performs a precautionary DELETE before removing services:

```
DELETE FROM calculation_services
WHERE service_id IN [all service IDs targeted for deletion]
```

This handles the `ON DELETE RESTRICT` FK constraint. If no such junction rows exist (expected for a new product), this DELETE is a no-op.

**Parent `calculations` rows are NOT touched.** The stored `final_price`, `subtotal`, and all other calculation columns retain their original values.

---

## Deletion Count Summary

| Source | Categories Deleted | Services Deleted |
|--------|-------------------|-----------------|
| Category cascade: Development | 1 | 46 |
| Category cascade: Marketing & Launch | 1 | 33 |
| Individual (Strategy & Research) | 0 | 4 |
| Individual (Design & UI/UX) | 0 | 15 |
| **Total** | **2** | **98** |

**Surviving catalogue**: 2 categories, 34 services.

---

## Deletion Order (Required by FK Constraints)

```
Step 1: DELETE from calculation_services
        WHERE service_id IN (services targeted for deletion)
        ── handles ON DELETE RESTRICT before service rows are removed

Step 2: DELETE from categories
        WHERE name IN ('Development', 'Marketing & Launch')
        ── ON DELETE CASCADE removes all services in those categories automatically

Step 3: DELETE from services
        WHERE name IN (19 individual services)
        AND category_id IN (SELECT id FROM categories WHERE name IN ('Strategy & Research', 'Design & UI/UX'))
        ── cleans up individual services from surviving categories
```
