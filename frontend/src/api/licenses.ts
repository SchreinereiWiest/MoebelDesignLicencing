import { api } from './client'
import type { License, LicenseInput, LicenseListResponse } from '../types'

const payload = (input: LicenseInput) => ({
  ...input,
  maxUsers: input.maxUsers || null,
  validUntil: input.validUntil ? `${input.validUntil}T23:59:59.000Z` : null,
  tenantId: input.tenantId || null,
  tenantSlug: input.tenantSlug || null,
})

export const loadLicenses = (search: string, status: string, page: number) => {
  const params = new URLSearchParams({ search, status, page: String(page), pageSize: '25' })
  return api<LicenseListResponse>(`/api/admin/licenses?${params}`)
}

export const createLicense = (input: LicenseInput) => api<{ license: License; activationKey: string }>('/api/admin/licenses', {
  method: 'POST',
  body: JSON.stringify(payload(input)),
})

export const updateLicense = (id: string, input: LicenseInput) => api<{ license: License }>(`/api/admin/licenses/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(payload(input)),
})

export const deleteLicense = (id: string) => api<void>(`/api/admin/licenses/${id}`, { method: 'DELETE' })

export const rotateLicenseKey = (id: string) => api<{ license: License; activationKey: string }>(`/api/admin/licenses/${id}/rotate-key`, {
  method: 'POST',
})
