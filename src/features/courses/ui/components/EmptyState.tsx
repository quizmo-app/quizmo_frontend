import type { ReactNode } from 'react'

/** État vide ou d'erreur d'un écran du tableau de bord. */
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-surface-200 px-(--space-6) py-(--space-7) text-center">
      <h2 className="typo-h2 text-ink">{title}</h2>
      <p className="mt-(--space-2) max-w-md typo-body text-ink-muted">{description}</p>
      {action && <div className="mt-(--space-5)">{action}</div>}
    </div>
  )
}
