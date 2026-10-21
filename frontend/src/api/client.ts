type ApiErrorBody = { error?: string; message?: string }

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || 'Die Anfrage konnte nicht verarbeitet werden.')
    this.name = 'ApiError'
    this.status = status
    this.code = body.error
  }
}

const csrfToken = () => document.cookie
  .split('; ')
  .find((entry) => entry.startsWith('XSRF-TOKEN='))
  ?.split('=')[1]

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  headers.set('accept', 'application/json')
  if (options.body) headers.set('content-type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = csrfToken()
    if (token) headers.set('x-xsrf-token', decodeURIComponent(token))
  }

  const response = await fetch(path, { ...options, headers, credentials: 'include' })
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => ({})) as ApiErrorBody
  if (!response.ok) throw new ApiError(response.status, body)
  return body as T
}
