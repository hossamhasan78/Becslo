-- Migration: Add indexes for analytics performance
-- Description: Creates indexes to optimize analytics queries for admin dashboard
-- Performance targets: Analytics < 3s, Pagination < 2s

-- Index on calculations.created_at for date range filtering (critical for analytics and calculations viewer)
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);

-- Index on calculations.client_country_id for top client countries query
CREATE INDEX IF NOT EXISTS idx_calculations_client_country ON calculations(client_country_id);

-- Index on calculations.user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);

-- Composite index for analytics queries that filter by date and country
CREATE INDEX IF NOT EXISTS idx_calculations_created_at_client_country 
ON calculations(created_at DESC, client_country_id);

-- Index on calculation_services.service_id for most used services query (critical for analytics)
CREATE INDEX IF NOT EXISTS idx_calculation_services_service_id ON calculation_services(service_id);

-- Index on calculation_services.calculation_id for parent calculation queries
CREATE INDEX IF NOT EXISTS idx_calculation_services_calculation_id ON calculation_services(calculation_id);

-- Composite index for service usage analytics over time (uses calculation's created_at via join)
CREATE INDEX IF NOT EXISTS idx_calculation_services_service_calc 
ON calculation_services(service_id, calculation_id);

-- Partial index for active services (optimizes queries that filter by is_active = true)
CREATE INDEX IF NOT EXISTS idx_services_active ON services(id) WHERE is_active = true;

-- Index on services.category_id for category filtering
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);

-- Index on countries.code for country code lookups
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);

-- Index on categories.display_order for category sorting
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Index on config table for single record optimization
CREATE INDEX IF NOT EXISTS idx_config_id ON config(id);

-- Index on calculation_services for cost aggregation queries
CREATE INDEX IF NOT EXISTS idx_calculation_services_cost ON calculation_services(calculation_id, cost);

-- Index comments for documentation
COMMENT ON INDEX idx_calculations_created_at IS 
  'Critical for analytics date range filtering and calculations viewer performance';
COMMENT ON INDEX idx_calculation_services_service_id IS 
  'Critical for most used services aggregation in analytics';
COMMENT ON INDEX idx_services_active IS 
  'Optimizes active services filtering for user service selection';
