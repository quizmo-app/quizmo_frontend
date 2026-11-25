import type { AsyncState } from '@/shared/domain/AsyncState'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import type { CoursePageContent } from '../../domain/PresentationPlan'

/** Page de cours (capture du PDF importé) affichée en plein cadre, avec préchauffage de la page suivante. */
export function CoursePageView({
  page,
  next,
  onRetry,
}: {
  page: AsyncState<CoursePageContent>
  next: CoursePageContent | null
  onRetry: () => void
}) {
  return (
    <div className="relative flex size-full items-center justify-center">
      {page.status === 'success' && (
        <img
          key={page.data.pdfPage}
          src={page.data.src}
          alt={`Page ${page.data.pdfPage} du cours`}
          className="max-h-full max-w-full rounded-sm object-contain shadow-stage"
          draggable={false}
        />
      )}

      {(page.status === 'loading' || page.status === 'idle') && <Spinner className="size-10 text-brand" />}

      {page.status === 'error' && (
        <div role="alert" className="max-w-md rounded-md border border-border bg-surface-200 p-(--space-6) text-center">
          <p className="typo-h2 text-ink">Cette page ne s'affiche pas</p>
          <p className="mt-(--space-2) typo-body text-ink-muted">{page.error.message}</p>
          <Button className="mt-(--space-5)" onClick={onRetry}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Préchargement de l'image de la page suivante (cache navigateur). */}
      {next && <img src={next.src} alt="" aria-hidden="true" className="hidden" />}
    </div>
  )
}
