import { Link } from 'react-router'
import { paths } from '@/shared/routing/paths'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { canDelete, lifecycleOf, presentability, type Course } from '../domain/Course'
import { plural } from './format'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const lifecycleBadge = {
  initialized: { tone: 'neutral', label: 'Sans quiz' },
  interactive: { tone: 'success', label: 'Prêt pour la séance' },
  'in-session': { tone: 'brand', label: 'En séance' },
} as const

/** Carte de cours du tableau de bord (surface-200, radius-md, shadow-card). */
export function CourseCard({
  course,
  onPresent,
  onDelete,
}: {
  course: Course
  onPresent: (course: Course) => void
  onDelete: (course: Course) => void
}) {
  const check = presentability(course)
  const lifecycle = lifecycleBadge[lifecycleOf(course)]
  const deletable = canDelete(course)

  return (
    <article className="flex h-full flex-col rounded-md border border-border bg-surface-200 p-(--space-4) shadow-card">
      <div className="flex flex-wrap items-center gap-(--space-2)">
        <Badge>Version {course.currentVersion}</Badge>
        <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
        {course.archived && <Badge>Archivé</Badge>}
        {!course.pdfAvailable && <Badge tone="danger">PDF indisponible</Badge>}
      </div>

      <h2 className="mt-(--space-4) typo-h2 text-ink">
        <Link
          to={paths.courseEditor(course.id)}
          className="rounded-sm hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {course.title}
        </Link>
      </h2>
      <p className="mt-(--space-2) line-clamp-2 flex-1 typo-body-small text-ink-muted">{course.description}</p>

      <ul className="mt-(--space-4) flex flex-wrap gap-x-(--space-4) gap-y-(--space-1) typo-body-small text-ink-muted">
        <li>{plural(course.pageCount, 'page')}</li>
        <li>{plural(course.quizCount, 'quiz', 'quiz')}</li>
        <li>{plural(course.leaderboardCount, 'classement')}</li>
      </ul>

      <p className="mt-(--space-3) typo-body-small text-ink-muted">Modifié le {dateFormatter.format(course.updatedAt)}</p>

      <div className="mt-(--space-4) flex flex-wrap items-center gap-(--space-2) border-t border-border pt-(--space-4)">
        <Button
          size="sm"
          variant={check.canPresent ? 'primary' : 'secondary'}
          onClick={() => onPresent(course)}
          title={check.canPresent ? undefined : `${check.reason} : la présentation sera refusée`}
        >
          {course.hasActivePresentation ? 'Reprendre' : 'Présenter'}
        </Button>
        <Link
          to={paths.courseEditor(course.id)}
          className="typo-button inline-flex h-9 items-center rounded-full border border-border bg-surface-200 px-(--space-4) text-ink hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Ouvrir
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={() => onDelete(course)}
          disabled={!deletable}
          title={deletable ? undefined : 'Terminez la présentation en cours pour supprimer ce cours.'}
          aria-label={`Supprimer « ${course.title} »`}
        >
          Supprimer
        </Button>
      </div>
    </article>
  )
}
