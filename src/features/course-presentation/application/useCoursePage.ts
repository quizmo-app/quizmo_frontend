import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import type { CoursePageContent, PresentationPlan } from '../domain/PresentationPlan'
import type { PresentationRepository } from '../domain/PresentationRepository'
import { itemAt, nextCoursePage } from '../domain/planQueries'
import { loadCoursePage } from '../domain/useCases'

/**
 * Charge la page de cours affichée puis précharge la page de cours suivante.
 * Les contenus sont mis en cache pour la durée de la présentation (la version est figée).
 */
export function useCoursePage(params: {
  repository: PresentationRepository
  plan: PresentationPlan | null
  index: number
  /** Faux pendant l'état « Interrompue » : aucun chargement n'est tenté. */
  enabled: boolean
  onFailure: (error: unknown) => AppError
}) {
  const { repository, plan, index, enabled, onFailure } = params
  const cacheRef = useRef(new Map<string, Promise<CoursePageContent>>())
  const [current, setCurrent] = useState<AsyncState<CoursePageContent>>({ status: 'idle' })
  const [next, setNext] = useState<CoursePageContent | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const fetchPage = useCallback(
    (targetPlan: PresentationPlan, pdfPage: number): Promise<CoursePageContent> => {
      const key = `${targetPlan.presentationId}:${targetPlan.version}:${pdfPage}`
      const cached = cacheRef.current.get(key)
      if (cached) return cached
      const promise = loadCoursePage(repository, targetPlan, { kind: 'course-page', key, pdfPage })
      cacheRef.current.set(key, promise)
      // En cas d'échec, l'entrée est retirée pour permettre une nouvelle tentative.
      promise.catch(() => cacheRef.current.delete(key))
      return promise
    },
    [repository],
  )

  const item = plan ? itemAt(plan, index) : undefined
  const pdfPage = item?.kind === 'course-page' ? item.pdfPage : null

  useEffect(() => {
    if (!plan || pdfPage === null || !enabled) return
    let cancelled = false
    setCurrent({ status: 'loading' })
    fetchPage(plan, pdfPage).then(
      (content) => {
        if (cancelled) return
        setCurrent({ status: 'success', data: content })
        // Préchargement de la page de cours suivante (échec silencieux).
        const upcoming = nextCoursePage(plan, index)
        if (upcoming) {
          fetchPage(plan, upcoming.item.pdfPage).then(
            (nextContent) => {
              if (!cancelled) setNext(nextContent)
            },
            () => undefined,
          )
        }
      },
      (error: unknown) => {
        if (!cancelled) setCurrent({ status: 'error', error: onFailure(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [fetchPage, plan, pdfPage, index, enabled, retryToken, onFailure])

  const retry = useCallback(() => setRetryToken((token) => token + 1), [])

  let visible: AsyncState<CoursePageContent> = current
  if (pdfPage === null) visible = { status: 'idle' }
  // Évite d'afficher furtivement l'ancienne page le temps que l'effet démarre le chargement.
  else if (current.status === 'success' && current.data.pdfPage !== pdfPage) visible = { status: 'loading' }

  return {
    /** `idle` lorsque l'élément affiché n'est pas une page de cours. */
    current: visible,
    next,
    retry,
  }
}
