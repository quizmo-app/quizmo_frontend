import { useRef } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { paths, type FlashState } from '@/shared/routing/paths'
import { useFlash } from '@/shared/routing/useFlash'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { enterFullscreen } from '@/shared/ui/fullscreen'
import { Notice } from '@/shared/ui/Notice'
import { TeacherLayout } from '@/shared/ui/TeacherLayout'
import { useCourseDeletion } from '../../application/useCourseDeletion'
import { useCourseEditor } from '../../application/useCourseEditor'
import type { CourseRepository, PageThumbnailRenderer } from '../../domain/CourseRepository'
import { insertionsAfter } from '../../domain/CourseStructure'
import { BackLink } from '../components/BackLink'
import { DeleteCourseDialog } from '../components/DeleteCourseDialog'
import { EmptyState } from '../components/EmptyState'
import { plural } from '../format'
import { InsertionChip } from './InsertionChip'
import { PageThumbnail } from './PageThumbnail'

/**
 * EF-03 → EF-06 — Éditeur de cours : miniatures des pages de la version active,
 * emplacements des quiz et classements, enregistrement de la structure.
 */
export function CourseEditorPage({
  repository,
  thumbnails,
}: {
  repository: CourseRepository
  thumbnails: PageThumbnailRenderer
}) {
  const { courseId = '' } = useParams()
  const editor = useCourseEditor(repository, courseId)
  const deletion = useCourseDeletion(repository)
  const navigate = useNavigate()
  const flash = useFlash()

  // Quitter l'éditeur avec des positions non enregistrées demande confirmation.
  const leavingAfterDeletion = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      editor.dirty && !leavingAfterDeletion.current && currentLocation.pathname !== nextLocation.pathname,
  )

  const { state, structure } = editor

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <TeacherLayout>
        <BackLink />
        <EditorSkeleton />
      </TeacherLayout>
    )
  }

  if (state.status === 'error' || state.status === 'empty' || !structure) {
    const error = state.status === 'error' ? state.error : null
    return (
      <TeacherLayout>
        <BackLink />
        <div className="mt-(--space-5)">
          <EmptyState
            title={
              error?.code === 'UNAUTHENTICATED'
                ? 'Session expirée'
                : error?.code === 'NOT_FOUND' || error?.code === 'FORBIDDEN'
                  ? 'Ce cours n’est pas accessible'
                  : 'Ce cours ne se charge pas'
            }
            description={error?.message ?? 'Ce cours est introuvable.'}
            action={
              error?.code === 'UNAUTHENTICATED' ? (
                <Button onClick={() => navigate(paths.login(paths.courseEditor(courseId)))}>Se reconnecter</Button>
              ) : error?.code === 'NOT_FOUND' || error?.code === 'FORBIDDEN' ? (
                <Button onClick={() => navigate(paths.dashboard)}>Retour au tableau de bord</Button>
              ) : (
                <Button onClick={editor.reload}>Réessayer</Button>
              )
            }
          />
        </div>
      </TeacherLayout>
    )
  }

  const readOnly = editor.lock !== null
  const quizCount = editor.draft.filter((i) => i.kind === 'quiz').length
  const leaderboardCount = editor.draft.length - quizCount
  const pages = Array.from({ length: structure.pageCount }, (_, i) => i + 1)
  const showSaveBar = editor.dirty || editor.save.status === 'saving' || editor.save.status === 'error'
  // Position 0 : avant la première page (même règle que la création de quiz et la présentation).
  const beforeFirstPage = insertionsAfter(editor.draft, 0)
  const renderSlot = (page: number) =>
    insertionsAfter(editor.draft, page).map((insertion) => (
      <InsertionChip
        key={insertion.id}
        insertion={insertion}
        pageCount={structure.pageCount}
        readOnly={readOnly}
        canShiftBack={editor.canShift(insertion.id, -1)}
        canShiftForward={editor.canShift(insertion.id, 1)}
        onShift={(direction) => editor.shift(insertion.id, direction)}
        onMove={(afterPage) => editor.moveTo(insertion.id, afterPage)}
      />
    ))

  const confirmDeletion = async () => {
    const deleted = await deletion.confirm()
    if (!deleted) return
    leavingAfterDeletion.current = true
    const navState: FlashState = {
      flash: { tone: 'success', message: `« ${deleted.title} » a été supprimé, avec ses PDF et les résultats associés.` },
    }
    navigate(paths.dashboard, { state: navState })
  }

  return (
    <TeacherLayout>
      <BackLink />

      <div className="mt-(--space-3) flex flex-wrap items-start justify-between gap-(--space-4)">
        <div className="min-w-0">
          <h1 className="typo-display-lg break-words text-ink">{structure.title}</h1>
          <div className="mt-(--space-3) flex flex-wrap items-center gap-(--space-2)">
            <Badge tone="brand">Version {structure.version}</Badge>
            <Badge>{plural(structure.pageCount, 'page')}</Badge>
            <Badge>{plural(quizCount, 'quiz', 'quiz')}</Badge>
            <Badge>{plural(leaderboardCount, 'classement')}</Badge>
            {structure.locked && <Badge tone="brand">En séance</Badge>}
            {structure.archived && <Badge>Archivé</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-(--space-2)">
          <Button
            disabled={readOnly}
            title={readOnly ? 'Ce cours est en lecture seule.' : undefined}
            onClick={() => navigate(paths.course(structure.courseId))}
          >
            Ajouter un quiz
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              enterFullscreen()
              navigate(paths.presentation(structure.courseId))
            }}
          >
            {structure.locked ? 'Reprendre la présentation' : 'Présenter'}
          </Button>
          <Button
            variant="ghost"
            disabled={structure.locked}
            title={structure.locked ? 'Terminez la présentation en cours pour supprimer ce cours.' : undefined}
            onClick={() =>
              deletion.request({ id: structure.courseId, title: structure.title, hasActivePresentation: structure.locked })
            }
          >
            Supprimer le cours
          </Button>
        </div>
      </div>

      <div className="mt-(--space-5) flex flex-col gap-(--space-3)">
        {flash && <Notice tone="success">{flash.message}</Notice>}
        {editor.lock === 'in-session' && (
          <Notice title="Cours verrouillé pendant la séance">
            Une présentation de ce cours est en cours. Terminez-la pour déplacer les quiz.
          </Notice>
        )}
        {editor.lock === 'archived' && (
          <Notice title="Cours archivé">Ce cours est en lecture seule. Vous pouvez encore le consulter ou le supprimer.</Notice>
        )}
        {editor.save.status === 'saved' && <Notice tone="success">Structure du cours enregistrée.</Notice>}
      </div>

      <section className="mt-(--space-5)" aria-labelledby="pages-title">
        <div className="flex flex-wrap items-baseline justify-between gap-(--space-2)">
          <h2 id="pages-title" className="typo-h2 text-ink">
            Pages et quiz
          </h2>
          {!readOnly && (
            <p className="typo-body-small text-ink-muted">
              Chaque quiz s’affiche après la page sous laquelle il est placé.
            </p>
          )}
        </div>

        {beforeFirstPage.length > 0 && (
          <div className="mt-(--space-4) rounded-md border border-border bg-surface-200 p-(--space-3) shadow-card">
            <p className="typo-label text-ink-muted">Avant la première page</p>
            <ul className="mt-(--space-2) grid gap-(--space-2) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Avant la première page">
              {renderSlot(0)}
            </ul>
          </div>
        )}

        <ol className="mt-(--space-4) grid items-start gap-(--space-3) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page) => {
            const slot = insertionsAfter(editor.draft, page)
            return (
              <li key={page} className="flex flex-col gap-(--space-2) rounded-md border border-border bg-surface-200 p-(--space-3) shadow-card">
                <PageThumbnail renderer={thumbnails} courseId={structure.courseId} version={structure.version} page={page} />
                <p className="typo-label text-ink-muted">Page {page}</p>
                {slot.length > 0 && (
                  <ul className="flex flex-col gap-(--space-2)" aria-label={`Après la page ${page}`}>
                    {renderSlot(page)}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>

        {editor.draft.length === 0 && (
          <p className="mt-(--space-4) typo-body text-ink-muted">
            Ce cours n’a encore ni quiz ni classement. Cliquez sur « Ajouter un quiz » : il apparaîtra ici, entre les pages.
          </p>
        )}
      </section>

      {showSaveBar && (
        <div className="sticky bottom-(--space-4) z-10 mt-(--space-6) flex flex-wrap items-center justify-between gap-(--space-3) rounded-full border border-border bg-surface-200 py-(--space-2) pr-(--space-2) pl-(--space-5) shadow-card">
          <p role="status" className={`typo-body-small ${editor.save.status === 'error' ? 'text-danger' : 'text-ink'}`}>
            {editor.save.status === 'error' ? editor.save.error.message : 'Modifications non enregistrées'}
          </p>
          <div className="flex gap-(--space-2)">
            <Button variant="ghost" size="sm" onClick={editor.discard} disabled={editor.save.status === 'saving'}>
              Annuler les modifications
            </Button>
            <Button size="sm" onClick={editor.saveDraft} disabled={editor.save.status === 'saving' || !editor.dirty}>
              {editor.save.status === 'saving' ? 'Enregistrement…' : 'Enregistrer la structure'}
            </Button>
          </div>
        </div>
      )}

      <DeleteCourseDialog
        course={deletion.pending}
        deleting={deletion.deleting}
        error={deletion.error}
        onCancel={deletion.cancel}
        onConfirm={confirmDeletion}
      />

      <Dialog
        open={blocker.state === 'blocked'}
        title="Quitter sans enregistrer ?"
        onClose={() => blocker.reset?.()}
        actions={
          <>
            <Button variant="ghost" onClick={() => blocker.proceed?.()}>
              Quitter sans enregistrer
            </Button>
            <Button onClick={() => blocker.reset?.()}>Rester sur le cours</Button>
          </>
        }
      >
        Les nouvelles positions de vos quiz seront perdues.
      </Dialog>
    </TeacherLayout>
  )
}

function EditorSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement du cours" className="mt-(--space-3)">
      <div className="h-11 w-2/3 rounded-sm bg-surface-300" />
      <div className="mt-(--space-3) flex gap-(--space-2)">
        <div className="h-6 w-24 rounded-full bg-surface-300" />
        <div className="h-6 w-20 rounded-full bg-surface-300" />
      </div>
      <ul className="mt-(--space-6) grid gap-(--space-3) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="rounded-md border border-border bg-surface-200 p-(--space-3) shadow-card">
            <div className="aspect-video rounded-sm bg-surface-300" />
            <div className="mt-(--space-2) h-4 w-16 rounded-sm bg-surface-300" />
          </li>
        ))}
      </ul>
    </div>
  )
}
