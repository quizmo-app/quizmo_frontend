import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/Button'
import { presentability, type Course } from '../domain/Course'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

/** Carte de cours du tableau de bord (surface-200, radius-md, shadow-card). */
export function CourseCard({ course, onPresent }: { course: Course; onPresent: (course: Course) => void }) {
  const check = presentability(course)

  return (
    <article className="flex h-full flex-col rounded-md border border-border bg-surface-200 p-(--space-4) shadow-card">
      <div className="flex flex-wrap items-center gap-(--space-2)">
        <Badge tone="neutral">Version {course.currentVersion}</Badge>
        {course.hasActivePresentation && <Badge tone="brand">En cours</Badge>}
        {course.archived && <Badge tone="neutral">Archivé</Badge>}
        {!course.pdfAvailable && <Badge tone="danger">PDF indisponible</Badge>}
      </div>

      <h2 className="mt-(--space-4) typo-h2 text-ink">{course.title}</h2>
      <p className="mt-(--space-2) line-clamp-2 flex-1 typo-body-small text-ink-muted">{course.description}</p>

      <ul className="mt-(--space-4) flex flex-wrap gap-x-(--space-4) gap-y-(--space-1) typo-body-small text-ink-muted">
        <li>{plural(course.pageCount, 'page')}</li>
        <li>{plural(course.quizCount, 'quiz', 'quiz')}</li>
        <li>{plural(course.leaderboardCount, 'classement')}</li>
      </ul>

      <div className="mt-(--space-4) flex items-center justify-between gap-(--space-3) border-t border-border pt-(--space-4)">
        <span className="typo-body-small text-ink-muted">Modifié le {dateFormatter.format(course.updatedAt)}</span>
        <Button
          size="sm"
          variant={check.canPresent ? 'primary' : 'secondary'}
          onClick={() => onPresent(course)}
          title={check.canPresent ? undefined : `${check.reason} : la présentation sera refusée`}
        >
          {course.hasActivePresentation ? 'Reprendre' : 'Présenter'}
        </Button>
      </div>
    </article>
  )
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

/** Badge de statut : forme pilule, style `label`. */
function Badge({ tone, children }: { tone: 'neutral' | 'brand' | 'danger'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-surface-300 text-ink-muted',
    brand: 'bg-brand text-brand-ink',
    danger: 'bg-danger text-danger-ink',
  }
  return <span className={`rounded-full px-(--space-2) py-(--space-1) typo-label ${tones[tone]}`}>{children}</span>
}
