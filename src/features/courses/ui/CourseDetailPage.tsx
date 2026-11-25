import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import type { InsertionRepository } from '@/features/insertion/domain/InsertionRepository'
import { InsertQuizForm } from '@/features/insertion/ui/InsertQuizForm'
import type { QuizRepository } from '@/features/quiz/domain/QuizRepository'
import { CreateQuizForm } from '@/features/quiz/ui/CreateQuizForm'
import { paths } from '@/shared/routing/paths'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { TeacherLayout } from '@/shared/ui/TeacherLayout'
import { useCourse } from '../application/useCourse'
import type { CourseRepository, PageThumbnailRenderer } from '../domain/CourseRepository'
import { BackLink } from './components/BackLink'
import { PageThumbnail } from './editor/PageThumbnail'

/**
 * Ajout d'un quiz à un cours : création (CU1.3/CU1.4) ou insertion d'un quiz existant (CU1.4, QM-13).
 * Les miniatures des pages (EF-03) servent à choisir visuellement la page après laquelle insérer ;
 * le déplacement des quiz déjà placés se fait dans l'éditeur (`/cours/:id/editer`).
 */
export function CourseDetailPage({
  courseRepository,
  quizRepository,
  insertionRepository,
  thumbnails,
}: {
  courseRepository: CourseRepository
  quizRepository: QuizRepository
  insertionRepository: InsertionRepository
  thumbnails: PageThumbnailRenderer
}) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { state, reload } = useCourse(courseRepository, courseId ?? '')
  const [afterPage, setAfterPage] = useState(0)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [insertFormOpen, setInsertFormOpen] = useState(false)

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

  if (createFormOpen) {
    return (
      <div className="mx-auto max-w-3xl px-(--space-6) py-(--space-6)">
        <CreateQuizForm
          repository={quizRepository}
          courseId={course.id}
          pageCount={course.pageCount}
          initialAfterPage={afterPage}
          onCreated={() => {
            setCreateFormOpen(false)
            reload()
          }}
          onCancel={() => setCreateFormOpen(false)}
        />
      </div>
    )
  }

  const pages = Array.from({ length: course.pageCount }, (_, i) => i + 1)
  const selectPage = (page: number) => {
    setAfterPage(page)
    // Le formulaire d'insertion lit la page choisie à son ouverture : on le referme pour la reprendre.
    setInsertFormOpen(false)
  }

  return (
    <TeacherLayout>
      <BackLink />

      <div className="mt-(--space-3) flex flex-wrap items-start justify-between gap-(--space-4)">
        <div className="min-w-0">
          <h1 className="typo-display-lg break-words text-ink">{course.title}</h1>
          <p className="mt-(--space-2) typo-body text-ink-muted">
            Version {course.currentVersion} · {course.pageCount} pages · {course.quizCount} quiz
          </p>
        </div>
        <Link
          to={paths.courseEditor(course.id)}
          className="typo-button inline-flex h-11 items-center rounded-full border border-border bg-surface-200 px-(--space-5) text-ink hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Voir et déplacer les quiz
        </Link>
      </div>

      <section className="mt-(--space-5)" aria-labelledby="choose-page-title">
        <h2 id="choose-page-title" className="typo-h2 text-ink">
          Choisissez où insérer le quiz
        </h2>
        <p className="mt-(--space-1) typo-body-small text-ink-muted">
          Cliquez sur une page : le quiz s’affichera juste après elle.
        </p>

        <div className="mt-(--space-4) flex flex-wrap items-end gap-(--space-3)">
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
              onChange={(event) => selectPage(Number(event.target.value))}
              className="w-24 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
            />
          </div>
          <Button onClick={() => setCreateFormOpen(true)}>Insérer un quiz</Button>
          {!insertFormOpen && (
            <Button variant="secondary" onClick={() => setInsertFormOpen(true)}>
              Insérer un quiz existant
            </Button>
          )}
        </div>
        <p className="mt-(--space-2) typo-body-small text-ink-muted">0 place le quiz avant la première page.</p>

        {insertFormOpen && (
          <div className="mt-(--space-4) flex flex-col gap-(--space-3)">
            <InsertQuizForm
              repository={insertionRepository}
              courseId={course.id}
              pageCount={course.pageCount}
              initialAfterPage={afterPage}
              onInserted={() => reload()}
            />
            <Button variant="secondary" onClick={() => setInsertFormOpen(false)}>
              Fermer
            </Button>
          </div>
        )}

        <ol className="mt-(--space-5) grid gap-(--space-3) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page) => {
            const selected = page === afterPage
            return (
              <li key={page}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectPage(page)}
                  className={`flex w-full flex-col gap-(--space-2) rounded-md border-2 bg-surface-200 p-(--space-3) text-left shadow-card hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                    selected ? 'border-brand' : 'border-border'
                  }`}
                >
                  <PageThumbnail renderer={thumbnails} courseId={course.id} version={course.currentVersion} page={page} />
                  <span className={`typo-label ${selected ? 'text-brand' : 'text-ink-muted'}`}>
                    Page {page}
                    {selected && ' · le quiz sera inséré après'}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </TeacherLayout>
  )
}
