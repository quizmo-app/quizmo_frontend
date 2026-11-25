import { Link } from 'react-router'
import { paths } from '@/shared/routing/paths'

/** Retour au tableau de bord (« Retour au tableau de bord » du diagramme d'étapes). */
export function BackLink() {
  return (
    <Link
      to={paths.dashboard}
      className="typo-button inline-flex items-center gap-(--space-1) rounded-full text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <span aria-hidden="true">←</span> Mes cours
    </Link>
  )
}
