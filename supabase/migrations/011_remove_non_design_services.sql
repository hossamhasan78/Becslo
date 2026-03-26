-- Migration: 011_remove_non_design_services.sql
-- Description: Remove non-design service categories and their services from database
-- Created: 2026-03-26
-- Purpose: Clean up unused non-design service catalogue from database
--
-- This migration permanently removes two entire service categories
-- ('Development', 'Marketing & Launch') and 19 individual non-design services
-- from the 'Strategy & Research' and 'Design & UI/UX' categories.
--
-- Execution order is CRITICAL for FK constraint safety:
-- 1. DELETE calculation_services WHERE service_id IN (all targeted services)
--    Covers: all ~79 Development/Marketing & Launch services + 19 individual services
--    Guards against ON DELETE RESTRICT before Step 2 category cascade.
-- 2. DELETE categories WHERE name IN ('Development', 'Marketing & Launch')
--    Cascades to all services in those categories (ON DELETE CASCADE on services.category_id).
-- 3. DELETE services WHERE name IN (19 individual services)
--    Removes the individual non-design services from the two surviving categories.
--
-- NOTE: Parent calculation rows in 'calculations' table are NOT touched.
-- The stored final_price, subtotal, and all other calculation columns
-- retain their original values per FR-007 (referential integrity guard).

-- ============================================================
-- Step 1: Pre-clean calculation_services junction table
-- Covers ALL services being removed so Step 2 cascade cannot fail
-- ============================================================
DELETE FROM public.calculation_services
WHERE service_id IN (
  -- All services in Development and Marketing & Launch (removed via category cascade in Step 2)
  SELECT s.id
  FROM public.services s
  JOIN public.categories c ON s.category_id = c.id
  WHERE c.name IN ('Development', 'Marketing & Launch')

  UNION

  -- 19 individual non-design services from surviving categories (removed directly in Step 3)
  SELECT s.id
  FROM public.services s
  JOIN public.categories c ON s.category_id = c.id
  WHERE c.name IN ('Strategy & Research', 'Design & UI/UX')
    AND s.name IN (
      -- 4 from Strategy & Research
      'Industry Trends Analysis',
      'Messaging Framework',
      'Pricing Strategy',
      'Product Positioning',
      -- 15 from Design & UI/UX
      'Banner & Ad Design',
      'Brand Identity Design',
      'Color Palette Creation',
      'E-commerce Design',
      'Empty State Design',
      'Error State Design',
      'Landing Page Design',
      'Loading State Design',
      'Logo Design',
      'Motion Graphics',
      'Packaging Design',
      'Print Design',
      'Social Media Graphics',
      'Typography Selection',
      'Video Editing'
    )
);

-- ============================================================
-- Step 2: Delete the two non-design categories
-- ON DELETE CASCADE on services.category_id removes all services within
-- Development had 46 services; Marketing & Launch had 33 services
-- ============================================================
DELETE FROM public.categories
WHERE name IN ('Development', 'Marketing & Launch');

-- ============================================================
-- Step 3: Delete 19 individual non-design services from surviving categories
-- (Services in Development/Marketing & Launch were already removed by Step 2 cascade)
-- ============================================================
DELETE FROM public.services
WHERE category_id IN (
  SELECT id FROM public.categories
  WHERE name IN ('Strategy & Research', 'Design & UI/UX')
)
AND name IN (
  -- 4 services from Strategy & Research
  'Industry Trends Analysis',
  'Messaging Framework',
  'Pricing Strategy',
  'Product Positioning',
  -- 15 services from Design & UI/UX
  'Banner & Ad Design',
  'Brand Identity Design',
  'Color Palette Creation',
  'E-commerce Design',
  'Empty State Design',
  'Error State Design',
  'Landing Page Design',
  'Loading State Design',
  'Logo Design',
  'Motion Graphics',
  'Packaging Design',
  'Print Design',
  'Social Media Graphics',
  'Typography Selection',
  'Video Editing'
);

-- Migration complete
-- Deleted: 2 categories, 98 service rows (46 Development + 33 Marketing & Launch + 19 individual)
-- Surviving: 2 categories (Strategy & Research, Design & UI/UX), 34 services
-- Parent calculation records in 'calculations' table remain intact
