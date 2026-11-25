import { usePageThumbnail } from '../../application/usePageThumbnail'
import type { PageThumbnailRenderer } from '../../domain/CourseRepository'

/** Miniature de la page n de la version active (EF-03). Squelette statique pendant le chargement. */
export function PageThumbnail({
  renderer,
  courseId,
  version,
  page,
}: {
  renderer: PageThumbnailRenderer
  courseId: string
  version: number
  page: number
}) {
  const { state, retry } = usePageThumbnail(renderer, courseId, version, page)

  return (
    <div className="aspect-video overflow-hidden rounded-sm border border-border bg-surface-300">
      {state.status === 'ready' && (
        <img src={state.src} alt={`Page ${page}`} className="size-full object-contain" draggable={false} />
      )}
      {state.status === 'error' && (
        <div className="flex size-full flex-col items-center justify-center gap-(--space-1) p-(--space-2) text-center">
          <span className="typo-body-small text-ink-muted">Aperçu indisponible</span>
          <button
            type="button"
            onClick={retry}
            className="typo-body-small font-bold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            Recharger
          </button>
        </div>
      )}
      {state.status === 'loading' && <span className="sr-only">Chargement de la page {page}</span>}
    </div>
  )
}
