import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { paths, type FlashState } from '@/shared/routing/paths'
import { Button } from '@/shared/ui/Button'
import { enterFullscreen } from '@/shared/ui/fullscreen'
import { Wordmark } from '@/shared/ui/Wordmark'
import { useMyCourses } from '../application/useMyCourses'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'
import { CourseCard } from './CourseCard'
import { ImportCourseForm } from './ImportCourseForm'

/** Tableau de bord enseignant (thème clair) : point d'entrée (« Présenter », « Importer un cours ») du CU1.2/CU2.1. */
export function DashboardPage({
  repository,
  footer,
}: {
  repository: CourseRepository
  /** Zone libre sous la liste (ex. panneau de démonstration), reçoit la fonction de rechargement. */
  footer?: (reload: () => void) => ReactNode
}) {
  const { state, reload } = useMyCourses(repository)
  const navigate = useNavigate()
  const flash = useFlash()
  const [importOuvert, setImportOuvert] = useState(false)

  const present = (course: Course) => {
    // Le plein écran doit être demandé pendant le clic (geste utilisateur).
    enterFullscreen()
    navigate(paths.presentation(course.id))
  }

  const manage = (course: Course) => navigate(paths.course(course.id))

  return (
    <div className="min-h-full bg-surface-100">
      <header className="border-b border-border bg-surface-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-(--space-6) py-(--space-4)">
          <Wordmark />
          <span className="typo-label text-ink-muted">Espace enseignant</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-(--space-6) py-(--space-6)">
        <div className="flex flex-wrap items-end justify-between gap-(--space-4)">
          <div>
            <h1 className="typo-display-lg text-ink">Mes cours</h1>
            <p className="mt-(--space-2) typo-body text-ink-muted">
              Choisissez un cours, puis cliquez sur « Présenter » pour animer votre séance.
            </p>
          </div>
          <div className="flex gap-(--space-2)">
            <Button variant="secondary" size="sm" onClick={reload} disabled={state.status === 'loading'}>
              Actualiser
            </Button>
            {!importOuvert && (
              <Button size="sm" onClick={() => setImportOuvert(true)}>
                Importer un cours
              </Button>
            )}
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

          {flash && (
            <div role="status" className="mb-(--space-5) rounded-md bg-success px-(--space-4) py-(--space-3) typo-body text-success-ink">
              {flash.message}
            </div>
          )}

          {state.status === 'loading' && <CourseGridSkeleton />}

          {state.status === 'empty' && (
            <EmptyState
              title="Aucun cours pour le moment"
              description="Importez un PDF pour créer votre premier cours : il apparaîtra ici, prêt à être présenté."
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
                  <CourseCard course={course} onPresent={present} onManage={manage} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {footer && <div className="mt-(--space-7)">{footer(reload)}</div>}
      </main>
    </div>
  )
}

/** Affiche une seule fois le message flash transmis par la navigation (ex. retour de présentation). */
function useFlash() {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash] = useState(() => (location.state as FlashState | null)?.flash)
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])
  return flash
}

/** Squelette statique : la charte réserve les animations prolongées au classement. */
function CourseGridSkeleton() {
  return (
    <ul className="grid gap-(--space-3) sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Chargement des cours">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="h-60 rounded-md border border-border bg-surface-200 p-(--space-4) shadow-card">
          <div className="h-6 w-24 rounded-full bg-surface-300" />
          <div className="mt-(--space-4) h-7 w-3/4 rounded-sm bg-surface-300" />
          <div className="mt-(--space-3) h-4 w-full rounded-sm bg-surface-300" />
          <div className="mt-(--space-2) h-4 w-2/3 rounded-sm bg-surface-300" />
        </li>
      ))}
    </ul>
  )
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-surface-200 px-(--space-6) py-(--space-7) text-center">
      <h2 className="typo-h2 text-ink">{title}</h2>
      <p className="mt-(--space-2) max-w-md typo-body text-ink-muted">{description}</p>
      {action && <div className="mt-(--space-5)">{action}</div>}
    </div>
  )
}
