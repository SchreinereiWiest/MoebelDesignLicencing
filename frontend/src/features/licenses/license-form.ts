import type { License, LicenseInput } from '../../types'

export const licenseToInput = (license: License): LicenseInput => ({
  companyName: license.companyName,
  tenantId: license.tenantId || '',
  tenantSlug: license.tenantSlug || '',
  plan: license.plan,
  features: license.features,
  maxUsers: license.maxUsers?.toString() || '',
  validUntil: license.validUntil?.slice(0, 10) || '',
  status: license.status === 'expired' ? 'active' : license.status,
})
