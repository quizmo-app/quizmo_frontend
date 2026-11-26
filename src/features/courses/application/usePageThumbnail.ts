import { useEffect, useState } from 'react'
import type { PageImage, PageThumbnailRenderer } from '../domain/CourseRepository'

export type ThumbnailState = { status: 'loading' } | { status: 'ready'; image: PageImage } | { status: 'error' }

/** Charge la miniature d'une page (EF-03) ; une erreur n'empêche pas d'éditer les positions. */
export function usePageThumbnail(renderer: PageThumbnailRenderer, courseId: string, version: number, page: number) {
  const [state, setState] = useState<ThumbnailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    renderer.render(courseId, version, page).then(
      (image) => !cancelled && setState({ status: 'ready', image }),
      () => !cancelled && setState({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [renderer, courseId, version, page, attempt])

  return { state, retry: () => setAttempt((a) => a + 1) }
}
