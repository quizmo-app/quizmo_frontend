import { useCallback, useEffect, useReducer, useRef } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { PresentationPlan } from '../domain/PresentationPlan'
import type { PresentationRepository } from '../domain/PresentationRepository'
import {
  initialPresentationState,
  phaseOf,
  presentationReducer,
  type NavigationTarget,
} from '../domain/presentationMachine'
import { itemAt } from '../domain/planQueries'
import { endPresentation, recordPosition, startPresentation } from '../domain/useCases'

const SAVE_DEBOUNCE_MS = 300

/**
 * Orchestration du cycle de vie d'une présentation :
 * démarrage/reprise, navigation, enregistrement de la page courante,
 * coupure/reprise réseau, quiz en cours, clôture.
 */
export function usePresentation(repository: PresentationRepository, courseId: string) {
  const [state, dispatch] = useReducer(presentationReducer, initialPresentationState)

  // ── Démarrage, dédoublonné : StrictMode exécute deux fois les effets en développement ──
  const startRef = useRef<{ courseId: string; promise: Promise<PresentationPlan> } | null>(null)
  useEffect(() => {
    let start = startRef.current
    if (!start || start.courseId !== courseId) {
      start = { courseId, promise: startPresentation(repository, courseId) }
      startRef.current = start
    }
    let cancelled = false
    start.promise.then(
      (plan) => {
        if (!cancelled) dispatch({ type: 'PLAN_RECEIVED', plan })
      },
      (error: unknown) => {
        if (!cancelled) dispatch({ type: 'CONTROL_FAILED', error: AppError.from(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository, courseId])

  const active = state.status === 'presenting' || state.status === 'interrupted'
  const plan = active ? state.plan : null
  const index = active ? state.index : -1

  /** Une coupure réseau ou une session expirée fait passer la présentation à « Interrompue ». */
  const reportFailure = useCallback((error: unknown): AppError => {
    const appError = AppError.from(error)
    if (appError.code === 'NETWORK' || appError.code === 'UNAUTHENTICATED') {
      dispatch({ type: 'CONNECTION_LOST', error: appError })
    }
    return appError
  }, [])

  // ── Enregistrer la page courante (débouncé pour absorber la navigation rapide) ──
  const lastSavedRef = useRef<string | null>(null)
  useEffect(() => {
    if (state.status !== 'presenting' || !plan) return
    const key = `${plan.presentationId}:${index}`
    if (lastSavedRef.current === key) return
    const timer = setTimeout(() => {
      recordPosition(repository, plan, index).then(() => {
        lastSavedRef.current = key
      }, reportFailure)
    }, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [repository, plan, index, state.status, reportFailure])

  // ── Coupure réseau détectée par le navigateur ──
  useEffect(() => {
    const onOffline = () => dispatch({ type: 'CONNECTION_LOST', error: new AppError('NETWORK') })
    window.addEventListener('offline', onOffline)
    return () => window.removeEventListener('offline', onOffline)
  }, [])

  // ── Reprise automatique au retour du réseau (pas pour une session expirée) ──
  const interruptedByNetwork = state.status === 'interrupted' && state.error.code === 'NETWORK'
  useEffect(() => {
    if (!interruptedByNetwork) return
    const onOnline = () => dispatch({ type: 'CONNECTION_RESTORED' })
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [interruptedByNetwork])

  const navigate = useCallback((target: NavigationTarget) => dispatch({ type: 'NAVIGATE', target }), [])
  const launchQuiz = useCallback(() => dispatch({ type: 'LAUNCH_QUIZ' }), [])
  const closeQuiz = useCallback(() => dispatch({ type: 'QUIZ_CLOSED' }), [])
  const resume = useCallback(() => dispatch({ type: 'CONNECTION_RESTORED' }), [])

  const endingRef = useRef(false)
  const end = useCallback(async () => {
    if (endingRef.current) return
    endingRef.current = true
    if (plan) {
      try {
        await endPresentation(repository, plan)
      } catch (error) {
        // Best effort : si la clôture échoue, la présentation reste active côté serveur
        // et sera reprise au prochain « Présenter ».
        console.warn('[CU2.1] Clôture de la présentation impossible', error)
      }
    }
    dispatch({ type: 'END' })
  }, [repository, plan])

  return {
    state,
    plan,
    index,
    phase: phaseOf(state),
    currentItem: plan ? itemAt(plan, index) : undefined,
    navigate,
    launchQuiz,
    closeQuiz,
    resume,
    end,
    reportFailure,
  }
}
