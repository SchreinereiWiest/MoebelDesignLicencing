import { useState } from 'react'
import { Check, X } from 'lucide-react'
import Button from '../../components/Button'
import type { License, LicenseInput } from '../../types'
import { licenseToInput } from './license-form'

const featureOptions = [
  ['crm', 'CRM'],
  ['cabinet', 'Schrankplanung'],
  ['nesting', 'Nesting'],
  ['management', 'Management'],
  ['storage', 'Lager'],
  ['time', 'Zeiterfassung'],
  ['purchasing', 'Einkauf'],
] as const

const emptyForm: LicenseInput = {
  companyName: '',
  tenantId: '',
  tenantSlug: '',
  plan: 'professional',
  features: featureOptions.map(([value]) => value),
  maxUsers: '10',
  validUntil: '',
  status: 'active',
}

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-copper-400 focus:ring-4 focus:ring-copper-400/10'

type Props = {
  license: License | null
  saving: boolean
  onClose: () => void
  onSave: (input: LicenseInput) => Promise<void>
}

export default function LicenseFormModal({ license, saving, onClose, onSave }: Props) {
  const [form, setForm] = useState<LicenseInput>(license ? licenseToInput(license) : emptyForm)
  const [error, setError] = useState('')

  const set = <K extends keyof LicenseInput>(key: K, value: LicenseInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleFeature = (feature: string) => {
    set('features', form.features.includes(feature)
      ? form.features.filter((item) => item !== feature)
      : [...form.features, feature])
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await onSave(form)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Lizenz konnte nicht gespeichert werden')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-copper-500">Lizenzverwaltung</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">{license ? 'Lizenz bearbeiten' : 'Neue Lizenz anlegen'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Schließen" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X /></button>
        </div>

        <div className="space-y-7 px-6 py-7 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Firmenname" className="sm:col-span-2">
              <input value={form.companyName} onChange={(event) => set('companyName', event.target.value)} required placeholder="Möbelschreinerei Beispiel" className={inputClass} />
            </Field>
            <Field label="Tenant-ID" hint="Optional – wird sonst bei Aktivierung gebunden">
              <input value={form.tenantId} onChange={(event) => set('tenantId', event.target.value)} placeholder="UUID aus CarpentersProduction" className={inputClass} />
            </Field>
            <Field label="Tenant-Slug" hint="Optional">
              <input value={form.tenantSlug} onChange={(event) => set('tenantSlug', event.target.value)} placeholder="beispiel" className={inputClass} />
            </Field>
            <Field label="Lizenzmodell">
              <select value={form.plan} onChange={(event) => set('plan', event.target.value)} className={inputClass}>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Individuell</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(event) => set('status', event.target.value as LicenseInput['status'])} className={inputClass}>
                <option value="active">Aktiv</option>
                <option value="inactive">Deaktiviert</option>
                <option value="suspended">Pausiert</option>
                <option value="revoked">Widerrufen</option>
              </select>
            </Field>
            <Field label="Maximale Benutzer" hint="Leer = unbegrenzt">
              <input type="number" min="1" value={form.maxUsers} onChange={(event) => set('maxUsers', event.target.value)} placeholder="10" className={inputClass} />
            </Field>
            <Field label="Gültig bis" hint="Leer = unbegrenzt">
              <input type="date" value={form.validUntil} onChange={(event) => set('validUntil', event.target.value)} className={inputClass} />
            </Field>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-700">Freigeschaltete Module</legend>
            <p className="mt-1 text-xs text-slate-400">Module werden bei jeder Anfrage serverseitig geprüft.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featureOptions.map(([value, label]) => {
                const selected = form.features.includes(value)
                return (
                  <button key={value} type="button" onClick={() => toggleFeature(value)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${selected ? 'border-copper-400 bg-copper-400/10 text-ink-950' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <span className={`grid size-5 place-items-center rounded-md ${selected ? 'bg-copper-400 text-ink-950' : 'bg-slate-100'}`}>{selected && <Check size={14} strokeWidth={3} />}</span>
                    {label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
          <Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Speichert …' : license ? 'Änderungen speichern' : 'Lizenz anlegen'}</Button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        {label}{hint && <span className="text-right text-[11px] font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
