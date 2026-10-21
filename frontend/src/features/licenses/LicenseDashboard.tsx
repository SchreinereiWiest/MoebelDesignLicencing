import { useCallback, useEffect, useState } from 'react'
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import * as licenseApi from '../../api/licenses'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import AdminLayout from '../../layouts/AdminLayout'
import type { License, LicenseInput, LicenseListResponse } from '../../types'
import LicenseFormModal from './LicenseFormModal'
import { licenseToInput } from './license-form'
import SecretDialog from './SecretDialog'

const emptyData: LicenseListResponse = {
  items: [],
  pagination: { page: 1, pageSize: 25, total: 0, pages: 1 },
  summary: { total: 0, active: 0, expiring: 0, inactive: 0, licensedUsers: 0 },
}

const dateLabel = (value: string | null) => value
  ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(value))
  : 'Unbegrenzt'

export default function LicenseDashboard() {
  const [data, setData] = useState<LicenseListResponse>(emptyData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<License | null>(null)
  const [saving, setSaving] = useState(false)
  const [secret, setSecret] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await licenseApi.loadLicenses(search, status, page))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Lizenzen konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    const timeout = window.setTimeout(() => { void refresh() }, 220)
    return () => window.clearTimeout(timeout)
  }, [refresh])

  const openCreate = () => { setEditing(null); setEditorOpen(true) }
  const openEdit = (license: License) => { setEditing(license); setEditorOpen(true) }

  const save = async (input: LicenseInput) => {
    setSaving(true)
    try {
      if (editing) {
        await licenseApi.updateLicense(editing.id, input)
      } else {
        const result = await licenseApi.createLicense(input)
        setSecret(result.activationKey)
      }
      setEditorOpen(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (license: License) => {
    const input = licenseToInput(license)
    input.status = license.status === 'active' ? 'inactive' : 'active'
    await licenseApi.updateLicense(license.id, input)
    await refresh()
  }

  const remove = async (license: License) => {
    if (!window.confirm(`Lizenz für „${license.companyName}“ endgültig löschen?`)) return
    await licenseApi.deleteLicense(license.id)
    await refresh()
  }

  const rotate = async (license: License) => {
    if (!window.confirm('Neuen Aktivierungsschlüssel erzeugen? Der bisherige Schlüssel wird sofort ungültig.')) return
    const result = await licenseApi.rotateLicenseKey(license.id)
    setSecret(result.activationKey)
    await refresh()
  }

  const cards = [
    { label: 'Lizenzen gesamt', value: data.summary.total, icon: KeyRound, tone: 'bg-slate-100 text-slate-700' },
    { label: 'Aktive Lizenzen', value: data.summary.active, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Läuft in 30 Tagen ab', value: data.summary.expiring, icon: CalendarClock, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Lizenzierte Benutzer', value: data.summary.licensedUsers, icon: Users, tone: 'bg-copper-400/15 text-copper-500' },
  ]

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper-500">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">Lizenzübersicht</h1>
            <p className="mt-2 text-sm text-slate-500">Verwalte Installationen, Laufzeiten und Modulfreigaben.</p>
          </div>
          <Button onClick={openCreate}><Plus size={18} /> Neue Lizenz</Button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="surface-shadow rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={20} /></div>
              <div className="mt-5 text-3xl font-semibold tracking-tight text-ink-950">{value}</div>
              <div className="mt-1 text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </section>

        <section className="surface-shadow mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="relative w-full sm:max-w-md">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                placeholder="Firma, Lizenz-ID oder Tenant suchen …"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-copper-400 focus:ring-4 focus:ring-copper-400/10"
              />
            </div>
            <div className="flex gap-2">
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="min-w-36 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-copper-400">
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="expired">Abgelaufen</option>
                <option value="inactive">Deaktiviert</option>
                <option value="suspended">Pausiert</option>
                <option value="revoked">Widerrufen</option>
              </select>
              <button onClick={() => void refresh()} aria-label="Aktualisieren" className="rounded-xl border border-slate-300 p-2.5 text-slate-500 hover:bg-slate-50"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
            </div>
          </div>

          {error && <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Unternehmen</th>
                  <th className="px-5 py-4 font-semibold">Lizenz</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Benutzer</th>
                  <th className="px-5 py-4 font-semibold">Gültig bis</th>
                  <th className="px-5 py-4 text-right font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((license) => (
                  <tr key={license.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{license.companyName}</div>
                      <div className="mt-1 max-w-64 truncate font-mono text-[11px] text-slate-400">{license.tenantId || 'Noch nicht gebunden'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium capitalize text-slate-700">{license.plan}</div>
                      <div className="mt-1 font-mono text-[11px] text-slate-400">{license.licenseId}</div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={license.status} /></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{license.maxUsers ?? '∞'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{dateLabel(license.validUntil)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Action label="Bearbeiten" onClick={() => openEdit(license)}><Edit3 size={16} /></Action>
                        <Action label="Schlüssel erneuern" onClick={() => void rotate(license)}><Copy size={16} /></Action>
                        <Action label={license.status === 'active' ? 'Deaktivieren' : 'Aktivieren'} onClick={() => void toggle(license)}><Ban size={16} /></Action>
                        <Action label="Löschen" danger onClick={() => void remove(license)}><Trash2 size={16} /></Action>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && data.items.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><KeyRound /></div>
              <h3 className="mt-4 font-semibold text-slate-700">Keine Lizenzen gefunden</h3>
              <p className="mt-1 text-sm text-slate-400">Passe die Suche an oder lege eine neue Lizenz an.</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            <span>{data.pagination.total} Einträge</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="px-2">{page} / {data.pagination.pages}</span>
              <button disabled={page >= data.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        </section>
      </div>

      {editorOpen && <LicenseFormModal license={editing} saving={saving} onClose={() => setEditorOpen(false)} onSave={save} />}
      {secret && <SecretDialog secret={secret} onClose={() => setSecret('')} />}
    </AdminLayout>
  )
}

function Action({ label, danger = false, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={label} aria-label={label} onClick={onClick} className={`rounded-lg p-2 transition ${danger ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
      {children}
    </button>
  )
}
