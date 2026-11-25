import type { ReactNode } from 'react'

type Tone = 'info' | 'success' | 'danger'

const tones: Record<Tone, string> = {
  info: 'border-brand bg-surface-200 text-ink',
  success: 'border-success bg-success text-success-ink',
  danger: 'border-danger bg-surface-200 text-ink',
}

/** Bandeau de message (statut, alerte, erreur) — apparition instantanée, sans animation. */
export function Notice({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: Tone
  title?: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex flex-wrap items-start justify-between gap-(--space-3) rounded-md border-2 px-(--space-4) py-(--space-3) ${tones[tone]}`}
    >
      <div className="min-w-0 flex-1">
        {title && <p className="typo-button">{title}</p>}
        {children && <div className={`typo-body-small ${title ? 'mt-(--space-1)' : ''}`}>{children}</div>}
      </div>
      {action}
    </div>
  )
}
