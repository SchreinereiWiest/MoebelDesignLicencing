import { useState } from 'react'
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import Brand from '../../components/Brand'
import Button from '../../components/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Anmeldung fehlgeschlagen')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-ink-950 lg:grid-cols-[1.05fr_.95fr]">
      <section className="fine-grid relative hidden overflow-hidden border-r border-white/10 p-14 lg:flex lg:flex-col">
        <div className="absolute -left-32 top-1/3 size-96 rounded-full bg-copper-500/10 blur-3xl" />
        <Brand />
        <div className="relative my-auto max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-copper-300/20 bg-copper-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copper-300">
            <ShieldCheck size={15} /> Interne Administration
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">
            Lizenzen im Griff.<br /><span className="text-copper-300">Zugänge geschützt.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
            Zentrale Verwaltung aller CarpentersProduction-Installationen, Module und Laufzeiten an einem Ort.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <KeyRound className="text-copper-300" size={22} />
              <div className="mt-4 text-sm font-medium text-white">API-gesichert</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">Gehaste Client-Schlüssel und HTTPS im Produktivbetrieb.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <LockKeyhole className="text-copper-300" size={22} />
              <div className="mt-4 text-sm font-medium text-white">Nur für Admins</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">Datenbankbasierte Sessions mit CSRF-Schutz.</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600">MoebelDesignLicencing · Internal Operations</p>
      </section>

      <section className="flex items-center justify-center bg-[#f4f5f2] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 inline-flex rounded-2xl bg-ink-950 p-3 lg:hidden"><Brand /></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper-500">Admin Portal</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink-950">Willkommen zurück</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Melde dich mit deinem Administratorkonto an.</p>

          <form onSubmit={submit} className="mt-10 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">E-Mail-Adresse</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                placeholder="admin@moebeldesign.de"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-copper-400 focus:ring-4 focus:ring-copper-400/10"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Passwort</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-copper-400 focus:ring-4 focus:ring-copper-400/10"
              />
            </label>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <Button type="submit" disabled={submitting} className="w-full py-3.5">
              {submitting ? 'Anmeldung läuft …' : 'Sicher anmelden'} {!submitting && <ArrowRight size={17} />}
            </Button>
          </form>
          <p className="mt-8 text-center text-xs leading-5 text-slate-400">Zugriff ausschließlich für autorisierte Administratoren.</p>
        </div>
      </section>
    </main>
  )
}
