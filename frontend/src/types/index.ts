export type Admin = {
  id: string
  email: string
  displayName: string
}

export type LicenseStatus = 'active' | 'inactive' | 'suspended' | 'revoked' | 'expired'

export type License = {
  id: string
  licenseId: string
  productId: string
  tenantId: string | null
  companyName: string
  tenantSlug: string | null
  plan: string
  features: string[]
  maxUsers: number | null
  validUntil: string | null
  status: LicenseStatus
  activationKeyHint: string
  lastValidatedAt: string | null
  createdAt: string
  updatedAt: string
}

export type LicenseInput = {
  companyName: string
  tenantId: string
  tenantSlug: string
  plan: string
  features: string[]
  maxUsers: string
  validUntil: string
  status: Exclude<LicenseStatus, 'expired'>
}

export type LicenseSummary = {
  total: number
  active: number
  expiring: number
  inactive: number
  licensedUsers: number
}

export type LicenseListResponse = {
  items: License[]
  pagination: { page: number; pageSize: number; total: number; pages: number }
  summary: LicenseSummary
}
