import { useState } from 'react'
import { Check, X } from 'lucide-react'
import Button from '../../components/Button'
import type { License, LicenseInput } from '../../types'
import { licenseToInput } from './license-form'

type ProductId = LicenseInput['products'][number]

const productFeatures: Record<ProductId, ReadonlyArray<readonly [string, string]>> = {
  'carpenters-production': [
    ['crm', 'CRM'],
    ['work-preparation', 'Arbeitsvorbereitung'],
    ['calculation', 'Kalkulation'],
    ['shop', 'Shop'],
    ['business-management', 'Betriebsmanagement'],
  ],
  'moebel-design-suite': [
    ['public-content', 'Öffentliche Inhalte'],
    ['moodboards', 'Moodboards'],
  ],
}

const presets: Record<string, Pick<LicenseInput, 'products' | 'features'>> = {
  starter: { products: ['carpenters-production'], features: ['crm', 'work-preparation', 'shop'] },
  professional: { products: ['carpenters-production'], features: ['crm', 'work-preparation', 'calculation', 'shop', 'business-management'] },
  enterprise: {
    products: ['carpenters-production', 'moebel-design-suite'],
    features: [...productFeatures['carpenters-production'], ...productFeatures['moebel-design-suite']].map(([value]) => value),
  },
  design: { products: ['moebel-design-suite'], features: productFeatures['moebel-design-suite'].map(([value]) => value) },
}

const emptyForm: LicenseInput = {
  companyName: '',
  tenantId: '',
  tenantSlug: '',
  plan: 'professional',
  products: presets.professional.products,
  features: presets.professional.features,
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

  const selectPlan = (plan: string) => {
    const preset = presets[plan]
    setForm((current) => ({
      ...current,
      plan,
      ...(preset ? { products: [...preset.products], features: [...preset.features] } : {}),
    }))
  }

  const toggleProduct = (product: ProductId) => {
    setForm((current) => {
      const enabled = current.products.includes(product)
      const productModuleIds = new Set(productFeatures[product].map(([value]) => value))
      return {
        ...current,
        plan: 'custom',
        products: enabled ? current.products.filter((item) => item !== product) : [...current.products, product],
        features: enabled ? current.features.filter((feature) => !productModuleIds.has(feature)) : current.features,
      }
    })
  }

  const toggleFeature = (product: ProductId, feature: string) => {
    setForm((current) => ({
      ...current,
      plan: 'custom',
      products: current.products.includes(product) ? current.products : [...current.products, product],
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.products.length) {
      setError('Mindestens ein Produkt muss freigeschaltet sein.')
      return
    }
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

        <div className="space-y-8 px-6 py-7 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Firmenname" className="sm:col-span-2">
              <input value={form.companyName} onChange={(event) => set('companyName', event.target.value)} required placeholder="Möbelschreinerei Beispiel" className={inputClass} />
            </Field>
            <Field label="Tenant-ID" hint="Optional – wird sonst bei Aktivierung gebunden">
              <input value={form.tenantId} onChange={(event) => set('tenantId', event.target.value)} placeholder="UUID des Mandanten" className={inputClass} />
            </Field>
            <Field label="Tenant-Slug" hint="Optional">
              <input value={form.tenantSlug} onChange={(event) => set('tenantSlug', event.target.value)} placeholder="beispiel" className={inputClass} />
            </Field>
            <Field label="Lizenzmodell" hint="Preset – danach frei anpassbar">
              <select value={form.plan} onChange={(event) => selectPlan(event.target.value)} className={inputClass}>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="design">Design</option>
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

          <ProductSection
            title="Carpenters Production"
            description="Kaufmännische und produktionsnahe Unternehmensfunktionen."
            product="carpenters-production"
            enabled={form.products.includes('carpenters-production')}
            selectedFeatures={form.features}
            onToggleProduct={toggleProduct}
            onToggleFeature={toggleFeature}
          />

          <ProductSection
            title="Wiest Design Suite"
            description="Bildbasierte Gestaltung, externe Inhalte und persönliche Moodboards."
            product="moebel-design-suite"
            enabled={form.products.includes('moebel-design-suite')}
            selectedFeatures={form.features}
            onToggleProduct={toggleProduct}
            onToggleFeature={toggleFeature}
          />

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

function ProductSection({ title, description, product, enabled, selectedFeatures, onToggleProduct, onToggleFeature }: {
  title: string
  description: string
  product: ProductId
  enabled: boolean
  selectedFeatures: string[]
  onToggleProduct: (product: ProductId) => void
  onToggleFeature: (product: ProductId, feature: string) => void
}) {
  return (
    <section className="border-t border-slate-200 pt-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-ink-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button type="button" aria-pressed={enabled} onClick={() => onToggleProduct(product)} className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${enabled ? 'border-copper-400 bg-copper-400/10 text-ink-950' : 'border-slate-300 text-slate-500 hover:border-slate-400'}`}>
          <span className={`grid size-5 place-items-center rounded-md ${enabled ? 'bg-copper-400 text-ink-950' : 'bg-slate-100'}`}>{enabled && <Check size={14} strokeWidth={3} />}</span>
          {enabled ? 'Produkt aktiv' : 'Produkt freischalten'}
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {productFeatures[product].map(([value, label]) => {
          const selected = enabled && selectedFeatures.includes(value)
          return (
            <button key={value} type="button" disabled={!enabled} onClick={() => onToggleFeature(product, value)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${selected ? 'border-copper-400 bg-copper-400/10 text-ink-950' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <span className={`grid size-5 place-items-center rounded-md ${selected ? 'bg-copper-400 text-ink-950' : 'bg-slate-100'}`}>{selected && <Check size={14} strokeWidth={3} />}</span>
              {label}
            </button>
          )
        })}
      </div>
    </section>
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
