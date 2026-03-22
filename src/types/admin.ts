/**
 * Admin User interface for role-based access control
 * Links to Supabase auth users with admin privileges
 */
export interface AdminUser {
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

/**
 * Service entity representing a billable service option
 * Users select services in the pricing wizard
 */
export interface Service {
  id: string;
  name: string;
  category: string;
  default_hours: number;
  min_hours: number;
  max_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

/**
 * Input type for creating a new service
 */
export interface ServiceCreateInput {
  name: string;
  category: string;
  default_hours: number;
  min_hours: number;
  max_hours: number;
}

/**
 * Input type for updating an existing service
 * All fields optional except version for optimistic locking
 */
export interface ServiceUpdateInput extends Partial<ServiceCreateInput> {
  is_active?: boolean;
}

/**
 * Configuration entity for pricing parameters
 * Single record containing all adjustable pricing values
 */
export interface Configuration {
  id: string;
  base_rate: number;
  risk_buffer_min: number;
  risk_buffer_max: number;
  profit_margin_min: number;
  profit_margin_max: number;
  version: number;
  updated_at: string | null;
  updated_by: string | null;
}

/**
 * Input type for updating configuration
 * Requires version for optimistic locking conflict detection
 */
export interface ConfigurationUpdateInput {
  base_rate?: number;
  risk_buffer_min?: number;
  risk_buffer_max?: number;
  profit_margin_min?: number;
  profit_margin_max?: number;
  version: number;
}

/**
 * Calculation entity representing a completed pricing calculation
 * Immutable record stored for admin analytics
 */
export interface Calculation {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  pricing_model: string;
  experience_designer: number;
  experience_freelance: number;
  designer_country_id: string;
  client_country_id: string;
  total_hours: number;
  subtotal: number;
  risk_buffer: number;
  profit_margin: number;
  final_price: number;
  recommended_min: number;
  recommended_max: number;
  created_at: string;
}

/**
 * Individual service entry within a calculation
 * Links calculation to services with hours and costs
 */
export interface CalculationService {
  id: string;
  calculation_id: string;
  service_id: string;
  hours: number;
  adjusted_rate: number;
  cost: number;
  created_at: string;
}

/**
 * Country entity with geography multiplier for pricing
 */
export interface Country {
  id: string;
  name: string;
  code: string;
  multiplier: number;
  created_at: string;
}

/**
 * Aggregated analytics metrics for admin dashboard
 * Computed from calculation history
 */
export interface AnalyticsMetrics {
  average_price: number;
  average_hours: number;
  total_calculations: number;
  most_used_services: MostUsedService[];
  top_client_countries: TopClientCountry[];
}

/**
 * Service usage count for analytics
 */
export interface MostUsedService {
  service_id: string;
  service_name: string;
  count: number;
}

/**
 * Country calculation count for analytics
 */
export interface TopClientCountry {
  country_id: string;
  country_name: string;
  count: number;
}

/**
 * Extended calculation details with full breakdown
 * Includes services, costs, and multiplier details
 */
export interface CalculationDetails extends Calculation {
  services: CalculationServiceDetail[];
  costs: CostDetail[];
  multipliers: MultiplierDetails;
  designer_country: string;
  client_country: string;
}

/**
 * Service detail within calculation breakdown
 */
export interface CalculationServiceDetail {
  service_name: string;
  hours: number;
  adjusted_rate: number;
  cost: number;
}

/**
 * Cost detail within calculation breakdown
 */
export interface CostDetail {
  cost_name: string;
  amount: number;
}

/**
 * Multiplier values applied in calculation
 */
export interface MultiplierDetails {
  experience_multiplier: number;
  geography_multiplier: number;
  base_rate: number;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page: number;
  page_size: number;
}

/**
 * Pagination metadata in API responses
 */
export interface PaginationResult {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

/**
 * Date range filter parameters for analytics
 * ISO 8601 date format
 */
export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

/**
 * Paginated services list response
 */
export interface PaginatedServicesResponse {
  services: Service[];
  pagination: PaginationResult;
}

/**
 * Paginated calculations list response
 */
export interface PaginatedCalculationsResponse {
  calculations: CalculationListItem[];
  pagination: PaginationResult;
}

/**
 * Simplified calculation item for list display
 */
export interface CalculationListItem {
  id: string;
  user_name: string;
  user_email: string;
  final_price: number;
  created_at: string;
}

/**
 * Standard API response wrapper
 * @template T - Data payload type
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * API error details
 */
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
