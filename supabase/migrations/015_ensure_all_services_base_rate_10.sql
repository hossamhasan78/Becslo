-- Migration: 015_ensure_all_services_base_rate_10.sql
-- Description: Ensure ALL services have base_rate = $10
-- Created: 2026-03-29
-- Purpose: Guarantee consistent $10 base rate across all services regardless of prior state

-- Update ALL services to base_rate = $10 (no conditions, explicit set to 10)
UPDATE public.services SET base_rate = 10;

-- Verify the update (comment out in production, useful for local testing)
-- SELECT COUNT(*) as total_services, COUNT(CASE WHEN base_rate = 10 THEN 1 END) as services_at_10 FROM public.services;
