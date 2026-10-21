import { useState } from 'react'
import { Check, Copy, KeyRound, X } from 'lucide-react'
import Button from '../../components/Button'

export default function SecretDialog({ secret, onClose }: { secret: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(secret)
    setCopied(true)
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div className="grid size-12 place-items-center rounded-2xl bg-copper-400/15 text-copper-500"><KeyRound /></div>
          <button onClick={onClose} aria-label="Schließen" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink-950">Aktivierungsschlüssel sichern</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Dieser Schlüssel wird nur jetzt vollständig angezeigt. Speichere ihn sicher oder übertrage ihn direkt in CarpentersProduction.</p>
        <div className="mt-6 break-all rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700">{secret}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => void copy()}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Kopiert' : 'Kopieren'}</Button>
          <Button onClick={onClose}>Verstanden</Button>
        </div>
      </div>
    </div>
  )
}
