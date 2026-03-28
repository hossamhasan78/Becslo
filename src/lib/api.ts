/**
 * Base path for API calls
 * Next.js basePath does not apply to fetch() calls, so we need to manually prefix all API paths
 * The value comes from NEXT_PUBLIC_BASE_PATH environment variable (default: '/becslo')
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/becslo'

/**
 * Construct a full API URL with the base path prefix
 * @param path - API path like '/api/v1/services' or '/api/admin/calculations'
 * @returns Full path with base path prefix like '/becslo/api/v1/services'
 */
export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path // Return absolute URLs as-is
  }
  return `${BASE_PATH}${path}`
}
