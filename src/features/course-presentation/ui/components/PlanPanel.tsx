import { useEffect, useRef } from 'react'
import type { PlanItem, PresentationPlan } from '../../domain/PresentationPlan'
import { itemLabel } from '../../domain/planQueries'

/** Sommaire de la présentation : accès direct à la page n (affichage instantané, sans glissement). */
export function PlanPanel({
  plan,
  currentIndex,
  open,
  locked,
  onSelect,
  onClose,
}: {
  plan: PresentationPlan
  currentIndex: number
  open: boolean
  locked: boolean
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const currentRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) currentRef.current?.scrollIntoView({ block: 'center' })
  }, [open, currentIndex])

  if (!open) return null

  return (
    <aside
      aria-label="Sommaire de la présentation"
      className="absolute inset-y-0 left-0 z-20 flex w-88 flex-col border-r border-border bg-surface-200"
    >
      <header className="flex items-start justify-between gap-(--space-3) border-b border-border p-(--space-4)">
        <div className="min-w-0">
          <p className="typo-label text-ink-muted">Sommaire</p>
          <p className="mt-(--space-1) truncate typo-body text-ink">{plan.course.title}</p>
          <p className="typo-body-small text-ink-muted">
            Version {plan.version} · {plan.items.length} pages
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-(--space-2) text-ink-muted hover:bg-surface-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-focus-ring"
          aria-label="Fermer le sommaire"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {locked && (
        <p className="border-b border-border px-(--space-4) py-(--space-2) typo-body-small text-ink-muted">
          Clôturez le quiz pour naviguer à nouveau dans le cours.
        </p>
      )}

      <ol className="flex-1 overflow-y-auto p-(--space-2)">
        {plan.items.map((item, index) => {
          const current = index === currentIndex
          return (
            <li key={item.key}>
              <button
                ref={current ? currentRef : undefined}
                type="button"
                disabled={locked}
                aria-current={current ? 'step' : undefined}
                onClick={() => onSelect(index)}
                className={`flex w-full items-center gap-(--space-3) rounded-full px-(--space-3) py-(--space-2) text-left typo-body-small focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-48 ${current ? 'bg-brand text-brand-ink' : 'text-ink hover:bg-surface-300'}`}
              >
                <span className={`w-6 shrink-0 text-right tabular-nums ${current ? '' : 'text-ink-muted'}`}>{index + 1}</span>
                <KindDot item={item} />
                <span className="truncate">{itemLabel(item)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

function KindDot({ item }: { item: PlanItem }) {
  const color = item.kind === 'quiz' ? 'bg-accent' : item.kind === 'leaderboard' ? 'bg-podium-gold' : 'bg-ink-muted'
  return <span className={`size-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
}
