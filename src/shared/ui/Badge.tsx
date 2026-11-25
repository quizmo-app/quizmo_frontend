import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-300 text-ink-muted',
  brand: 'bg-brand text-brand-ink',
  success: 'bg-success text-success-ink',
  danger: 'bg-danger text-danger-ink',
}

/** Badge de statut (charte) : forme pilule, style `label`. */
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-(--space-2) py-(--space-1) typo-label ${tones[tone]}`}>
      {children}
    </span>
  )
}
