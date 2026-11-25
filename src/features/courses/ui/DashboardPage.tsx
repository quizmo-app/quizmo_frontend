import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/routing/paths'
import { useFlash } from '@/shared/routing/useFlash'
import { Button } from '@/shared/ui/Button'
import { enterFullscreen } from '@/shared/ui/fullscreen'
import { Notice } from '@/shared/ui/Notice'
import { TeacherLayout } from '@/shared/ui/TeacherLayout'
import { useCourseDeletion } from '../application/useCourseDeletion'
import { useMyCourses } from '../application/useMyCourses'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'
import { DeleteCourseDialog } from './components/DeleteCourseDialog'
import { EmptyState } from './components/EmptyState'
import { CourseCard } from './CourseCard'
import { ImportCourseForm } from './ImportCourseForm'

/**
 * EF-01 — Tableau de bord enseignant (thème clair) : liste des cours, version active et nombre de quiz.
 * Point d'entrée de l'import (CU1.2), de l'éditeur (EF-03), de l'ajout de quiz (CU1.3/CU1.4),
 * de la suppression (EF-07) et de la présentation (CU2.1).
 */
export function DashboardPage({
  repository,
  footer,
}: {
  repository: CourseRepository
  /** Zone libre sous la liste (ex. panneau de démonstration), reçoit la fonction de rechargement. */
  footer?: (reload: () => void) => ReactNode
}) {
  const { state, reload } = useMyCourses(repository)
  const deletion = useCourseDeletion(repository)
  const navigate = useNavigate()
  const flash = useFlash()
  const [importOuvert, setImportOuvert] = useState(false)
  const [deletedMessage, setDeletedMessage] = useState<string | null>(null)

  const present = (course: Course) => {
    // Le plein écran doit être demandé pendant le clic (geste utilisateur).
    enterFullscreen()
    navigate(paths.presentation(course.id))
  }

  const manage = (course: Course) => navigate(paths.course(course.id))

  const confirmDeletion = async () => {
    const deleted = await deletion.confirm()
    if (deleted) {
      setDeletedMessage(`« ${deleted.title} » a été supprimé, avec ses PDF et les résultats associés.`)
      reload()
    }
  }

  const statusMessage = deletedMessage ?? flash?.message

  return (
    <TeacherLayout footer={footer?.(reload)}>
      <div className="flex flex-wrap items-end justify-between gap-(--space-4)">
        <div>
          <h1 className="typo-display-lg text-ink">Mes cours</h1>
          <p className="mt-(--space-2) typo-body text-ink-muted">
            Ouvrez un cours pour placer vos quiz entre les pages, ou présentez-le directement en séance.
          </p>
        </div>
        <div className="flex flex-wrap gap-(--space-2)">
          <Button variant="secondary" onClick={reload} disabled={state.status === 'loading'}>
            Actualiser
          </Button>
          {!importOuvert && <Button onClick={() => setImportOuvert(true)}>Importer un cours</Button>}
        </div>
      </div>

      <div className="mt-(--space-5)">
        {importOuvert && (
          <div className="mb-(--space-5)">
            <ImportCourseForm
              repository={repository}
              onImported={() => {
                setImportOuvert(false)
                reload()
              }}
              onCancel={() => setImportOuvert(false)}
            />
          </div>
        )}

        {statusMessage && (
          <div className="mb-(--space-5)">
            <Notice tone="success">{statusMessage}</Notice>
          </div>
        )}

        {state.status === 'loading' && <CourseGridSkeleton />}

        {state.status === 'empty' && (
          <EmptyState
            title="Aucun cours pour le moment"
            description="Cliquez sur « Importer un cours » pour ajouter votre premier support PDF."
          />
        )}

        {state.status === 'error' && (
          <EmptyState
            title={state.error.code === 'UNAUTHENTICATED' ? 'Session expirée' : 'Vos cours ne se chargent pas'}
            description={state.error.message}
            action={
              state.error.code === 'UNAUTHENTICATED' ? (
                <Button onClick={() => navigate(paths.login(paths.dashboard))}>Se reconnecter</Button>
              ) : (
                <Button onClick={reload}>Réessayer</Button>
              )
            }
          />
        )}

        {state.status === 'success' && (
          <ul className="grid gap-(--space-3) sm:grid-cols-2 lg:grid-cols-3">
            {state.data.map((course) => (
              <li key={course.id}>
                <CourseCard
                  course={course}
                  onPresent={present}
                  onManage={manage}
                  onDelete={(c) => {
                    setDeletedMessage(null)
                    deletion.request(c)
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteCourseDialog
        course={deletion.pending}
        deleting={deletion.deleting}
        error={deletion.error}
        onCancel={deletion.cancel}
        onConfirm={confirmDeletion}
      />
    </TeacherLayout>
  )
}

/** Squelette statique : la charte réserve les animations prolongées au classement. */
function CourseGridSkeleton() {
  return (
    <ul className="grid gap-(--space-3) sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Chargement des cours">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="h-72 rounded-md border border-border bg-surface-200 p-(--space-4) shadow-card">
          <div className="h-6 w-24 rounded-full bg-surface-300" />
          <div className="mt-(--space-4) h-7 w-3/4 rounded-sm bg-surface-300" />
          <div className="mt-(--space-3) h-4 w-full rounded-sm bg-surface-300" />
          <div className="mt-(--space-2) h-4 w-2/3 rounded-sm bg-surface-300" />
        </li>
      ))}
    </ul>
  )
}
