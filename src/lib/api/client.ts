/**
 * Centralized API Client for CardMax Customer Frontend.
 * Communicates with the Payload CMS API backend.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
}

export class ApiError extends Error {
  status: number
  code?: string
  data?: any

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

function buildUrl(endpoint: string, params?: ApiRequestOptions['params']): string {
  // Ensure endpoint starts with '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`

  if (!params) return fullUrl

  const url = new URL(fullUrl)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })

  return url.toString()
}

async function request<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options

  const url = buildUrl(endpoint, params)

  const headers = new Headers(customHeaders || {})

  // Default to JSON if body is not FormData
  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Cross-origin cookies (payload-token) must always be included
  const res = await fetch(url, {
    credentials: 'include',
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    let errorData: any = null
    let errorMessage = `API request failed with status ${res.status}`
    let errorCode: string | undefined = undefined

    try {
      errorData = await res.json()
      if (typeof errorData === 'object' && errorData !== null) {
        errorMessage =
          errorData.message ||
          errorData.error ||
          (errorData.errors && errorData.errors[0]?.message) ||
          errorMessage
        errorCode = errorData.code
      }
    } catch {
      // response wasn't JSON
    }

    throw new ApiError(errorMessage, res.status, errorCode, errorData)
  }

  // If 204 No Content
  if (res.status === 204) {
    return {} as T
  }

  try {
    return await res.json()
  } catch {
    return {} as T
  }
}

export const apiClient = {
  get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' })
  },

  post<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    })
  },

  patch<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    })
  },

  put<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    })
  },

  delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  },
}

export default apiClient
