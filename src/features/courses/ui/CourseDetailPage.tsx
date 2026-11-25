import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import type { QuizRepository } from '@/features/quiz/domain/QuizRepository'
import { CreateQuizForm } from '@/features/quiz/ui/CreateQuizForm'
import { paths } from '@/shared/routing/paths'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { useCourse } from '../application/useCourse'
import type { CourseRepository } from '../domain/CourseRepository'

/**
 * Détail d'un cours : héberge l'insertion d'un quiz (CU1.3/CU1.4). Volontairement minimal au-delà
 * (titre, version, compteurs) : l'éditeur complet (miniatures de pages, aperçu des emplacements)
 * est la fonctionnalité CU1.6 Consulter et gérer ses cours, pas encore construite.
 */
export function CourseDetailPage({ courseRepository, quizRepository }: { courseRepository: CourseRepository; quizRepository: QuizRepository }) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { state, reload } = useCourse(courseRepository, courseId ?? '')
  const [afterPage, setAfterPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div className="flex min-h-full items-center justify-center bg-surface-100">
        <Spinner />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-(--space-4) bg-surface-100 p-(--space-6) text-center">
        <p className="typo-body text-ink-muted">{state.error.message}</p>
        <Button onClick={() => navigate(paths.dashboard)}>Retour au tableau de bord</Button>
      </div>
    )
  }

  // `AsyncState` prévoit un statut « empty » pour les listes ; un cours par id ne l'atteint jamais en pratique.
  if (state.status !== 'success') {
    return <Navigate to={paths.dashboard} replace />
  }

  const course = state.data

  if (formOpen) {
    return (
      <div className="mx-auto max-w-3xl px-(--space-6) py-(--space-6)">
        <CreateQuizForm
          repository={quizRepository}
          courseId={course.id}
          pageCount={course.pageCount}
          initialAfterPage={afterPage}
          onCreated={() => {
            setFormOpen(false)
            reload()
          }}
          onCancel={() => setFormOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-surface-100">
      <header className="border-b border-border bg-surface-200">
        <div className="mx-auto max-w-3xl px-(--space-6) py-(--space-4)">
          <Button variant="secondary" size="sm" onClick={() => navigate(paths.dashboard)}>
            ← Retour au tableau de bord
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-(--space-6) py-(--space-6)">
        <h1 className="typo-display-lg text-ink">{course.title}</h1>
        <p className="mt-(--space-2) typo-body text-ink-muted">
          Version {course.currentVersion} · {course.pageCount} pages · {course.quizCount} quiz
        </p>

        <p className="mt-(--space-4) rounded-sm bg-surface-300 px-(--space-4) py-(--space-3) typo-body-small text-ink-muted">
          L'éditeur complet (miniatures des pages, aperçu des emplacements) arrive avec la fonctionnalité Consulter et gérer ses cours.
        </p>

        <div className="mt-(--space-5) flex items-end gap-(--space-3)">
          <div className="flex flex-col gap-(--space-1)">
            <label htmlFor="course-after-page" className="typo-label text-ink-muted">
              Insérer un quiz après la page
            </label>
            <input
              id="course-after-page"
              type="number"
              min={0}
              max={course.pageCount}
              value={afterPage}
              onChange={(event) => setAfterPage(Number(event.target.value))}
              className="w-24 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
            />
          </div>
          <Button onClick={() => setFormOpen(true)}>Insérer un quiz</Button>
        </div>
      </main>
    </div>
  )
}
