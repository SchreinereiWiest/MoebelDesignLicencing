import { KeyRound, LayoutDashboard, LogOut, Server } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAuth } from '../app/useAuth'
import Brand from '../components/Brand'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[#f4f5f2] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden min-h-screen flex-col bg-ink-950 p-5 lg:flex">
        <div className="px-2 py-3"><Brand /></div>
        <nav className="mt-10 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            <LayoutDashboard size={18} className="text-copper-300" /> Übersicht
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500">
            <KeyRound size={18} /> Lizenzverwaltung
          </div>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><Server size={14} /> API bereit</div>
          <p className="mt-2 text-xs leading-5 text-slate-500">Direktverbindung über das Netzwerk MoebelDesign.</p>
        </div>
        <button onClick={() => void signOut()} className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
          <LogOut size={17} /> Abmelden
        </button>
      </aside>

      <div className="min-w-0">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="lg:hidden"><Brand compact /></div>
          <div className="hidden lg:block">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Administration</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">Lizenzzentrale</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-700">{admin?.displayName}</div>
              <div className="text-xs text-slate-400">{admin?.email}</div>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-ink-900 text-sm font-bold text-copper-300">
              {admin?.displayName.slice(0, 2).toUpperCase()}
            </div>
            <button onClick={() => void signOut()} aria-label="Abmelden" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden">
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="p-5 sm:p-8 xl:p-10">{children}</main>
      </div>
    </div>
  )
}
