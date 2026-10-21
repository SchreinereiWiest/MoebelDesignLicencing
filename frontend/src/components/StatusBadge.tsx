import type { LicenseStatus } from '../types'

const styles: Record<LicenseStatus, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  expired: 'border-amber-200 bg-amber-50 text-amber-700',
  inactive: 'border-slate-200 bg-slate-100 text-slate-600',
  suspended: 'border-orange-200 bg-orange-50 text-orange-700',
  revoked: 'border-red-200 bg-red-50 text-red-700',
}

const labels: Record<LicenseStatus, string> = {
  active: 'Aktiv',
  expired: 'Abgelaufen',
  inactive: 'Deaktiviert',
  suspended: 'Pausiert',
  revoked: 'Widerrufen',
}

export default function StatusBadge({ status }: { status: LicenseStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
}
