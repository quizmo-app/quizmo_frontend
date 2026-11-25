import type { AppError } from '@/shared/domain/AppError'
import type { PresentationPlan } from './PresentationPlan'
import { clampIndex, itemAt } from './planQueries'

/**
 * Machine à états du mode présentation (Figure 4 du dossier de conception).
 *
 *   Chargement ──plan reçu──▶ EnPresentation { PageCours | PageQuiz | PageLeaderboard | QuizEnCours }
 *   Chargement ──contrôle en échec──▶ Refusée
 *   EnPresentation ──coupure réseau──▶ Interrompue ──reprise──▶ EnPresentation
 *   EnPresentation ──l'enseignant termine──▶ Terminée
 *
 * Réducteur pur : aucune dépendance React ni réseau.
 */
export type PresentationState =
  | { status: 'loading' }
  | { status: 'refused'; error: AppError }
  | { status: 'presenting'; plan: PresentationPlan; index: number; quizRunning: boolean }
  | { status: 'interrupted'; plan: PresentationPlan; index: number; quizRunning: boolean; error: AppError }
  | { status: 'ended' }

export type NavigationTarget =
  | { kind: 'next' }
  | { kind: 'previous' }
  | { kind: 'first' }
  | { kind: 'last' }
  | { kind: 'index'; index: number }

export type PresentationEvent =
  | { type: 'PLAN_RECEIVED'; plan: PresentationPlan }
  | { type: 'CONTROL_FAILED'; error: AppError }
  | { type: 'NAVIGATE'; target: NavigationTarget }
  | { type: 'LAUNCH_QUIZ' }
  | { type: 'QUIZ_CLOSED' }
  | { type: 'CONNECTION_LOST'; error: AppError }
  | { type: 'CONNECTION_RESTORED' }
  | { type: 'END' }

/** Sous-état de « EnPresentation ». */
export type PresentationPhase = 'course-page' | 'quiz-page' | 'leaderboard-page' | 'quiz-running'

export const initialPresentationState: PresentationState = { status: 'loading' }

export function presentationReducer(state: PresentationState, event: PresentationEvent): PresentationState {
  switch (state.status) {
    case 'loading':
      if (event.type === 'PLAN_RECEIVED') {
        return {
          status: 'presenting',
          plan: event.plan,
          index: clampIndex(event.plan, event.plan.startIndex),
          quizRunning: false,
        }
      }
      if (event.type === 'CONTROL_FAILED') return { status: 'refused', error: event.error }
      return state

    case 'presenting':
      switch (event.type) {
        case 'NAVIGATE': {
          // QuizEnCours : seule la clôture du quiz permet de revenir à la navigation.
          if (state.quizRunning) return state
          const index = resolveTarget(state.plan, state.index, event.target)
          return index === state.index ? state : { ...state, index }
        }
        case 'LAUNCH_QUIZ':
          return itemAt(state.plan, state.index)?.kind === 'quiz' && !state.quizRunning
            ? { ...state, quizRunning: true }
            : state
        case 'QUIZ_CLOSED':
          return state.quizRunning ? { ...state, quizRunning: false } : state
        case 'CONNECTION_LOST':
          return { status: 'interrupted', plan: state.plan, index: state.index, quizRunning: state.quizRunning, error: event.error }
        case 'END':
          return { status: 'ended' }
        default:
          return state
      }

    case 'interrupted':
      if (event.type === 'CONNECTION_RESTORED') {
        return { status: 'presenting', plan: state.plan, index: state.index, quizRunning: state.quizRunning }
      }
      if (event.type === 'END') return { status: 'ended' }
      return state

    case 'refused':
    case 'ended':
      return state
  }
}

export function resolveTarget(plan: PresentationPlan, current: number, target: NavigationTarget): number {
  switch (target.kind) {
    case 'next':
      return clampIndex(plan, current + 1)
    case 'previous':
      return clampIndex(plan, current - 1)
    case 'first':
      return 0
    case 'last':
      return clampIndex(plan, plan.items.length - 1)
    case 'index':
      return clampIndex(plan, target.index)
  }
}

export function phaseOf(state: PresentationState): PresentationPhase | undefined {
  if (state.status !== 'presenting' && state.status !== 'interrupted') return undefined
  if (state.quizRunning) return 'quiz-running'
  const item = itemAt(state.plan, state.index)
  switch (item?.kind) {
    case 'quiz':
      return 'quiz-page'
    case 'leaderboard':
      return 'leaderboard-page'
    default:
      return 'course-page'
  }
}
