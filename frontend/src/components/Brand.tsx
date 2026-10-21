export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-copper-400 text-sm font-black tracking-tight text-ink-950 shadow-lg shadow-copper-500/20">
        MD
      </div>
      {!compact && (
        <div>
          <div className="text-sm font-semibold tracking-wide text-white">MoebelDesign</div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-copper-300">Licence Control</div>
        </div>
      )}
    </div>
  )
}
