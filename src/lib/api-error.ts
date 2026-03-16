export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

export class ApiException extends Error {
  statusCode: number
  errorCode?: string

  constructor(message: string, statusCode: number = 500, errorCode?: string) {
    super(message)
    this.name = 'ApiException'
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

export const errorMessages = {
  network: 'Unable to connect. Please check your internet connection and try again.',
  server: 'Something went wrong on our end. Please try again in a few minutes.',
  unauthorized: 'Your session has expired. Please log in again.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  timeout: 'The request took too long. Please try again.',
  pdf: 'Unable to generate PDF. Please try again or contact support if the problem persists.',
}

export function parseError(error: unknown): ApiException {
  if (error instanceof ApiException) {
    return error
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiException(errorMessages.network, 0, 'NETWORK_ERROR')
  }

  if (error instanceof Response) {
    const statusCode = error.status
    
    if (statusCode === 0 || statusCode >= 500) {
      return new ApiException(errorMessages.server, statusCode, 'SERVER_ERROR')
    }
    if (statusCode === 401) {
      return new ApiException(errorMessages.unauthorized, statusCode, 'UNAUTHORIZED')
    }
    if (statusCode === 404) {
      return new ApiException(errorMessages.notFound, statusCode, 'NOT_FOUND')
    }
    if (statusCode === 400) {
      return new ApiException(errorMessages.validation, statusCode, 'VALIDATION_ERROR')
    }
  }

  if (error instanceof Error) {
    return new ApiException(error.message, 500, 'UNKNOWN_ERROR')
  }

  return new ApiException(errorMessages.server, 500, 'UNKNOWN_ERROR')
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: number
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options
  
  let lastError: Error | undefined
  let currentDelay = delay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, currentDelay))
        currentDelay *= backoff
      }
    }
  }

  throw lastError
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await withRetry(() => fetch(url, options), {
      maxAttempts: 3,
      delay: 1000,
    })

    if (!response.ok) {
      throw response
    }

    return await response.json()
  } catch (error) {
    const apiError = parseError(error)
    throw apiError
  }
}
