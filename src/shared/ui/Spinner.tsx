/** Indicateur d'attente (couleur `brand` du thème courant). */
export function Spinner({ className = 'size-8 text-brand', label = 'Chargement…' }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex">
      <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}
