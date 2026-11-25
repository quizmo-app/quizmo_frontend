import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '@/shared/routing/paths'
import { Wordmark } from './Wordmark'

/** Gabarit des écrans de préparation (thème « Tableau de bord » clair). */
export function TeacherLayout({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-full bg-surface-100">
      <header className="border-b border-border bg-surface-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-(--space-6) py-(--space-4)">
          <Link
            to={paths.dashboard}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Wordmark />
          </Link>
          <span className="typo-label text-ink-muted">Espace enseignant</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-(--space-6) py-(--space-6)">
        {children}
        {footer && <div className="mt-(--space-7)">{footer}</div>}
      </main>
    </div>
  )
}
