import { describe, expect, it } from 'vitest'
import { AppError } from '@/shared/domain/AppError'
import type { PresentationPlan } from './PresentationPlan'
import { initialPresentationState, phaseOf, presentationReducer, type PresentationState } from './presentationMachine'

const plan: PresentationPlan = {
  presentationId: 'p-1',
  course: { id: 'c-1', title: 'Cours' },
  version: 2,
  pageCount: 2,
  startIndex: 0,
  resumed: false,
  items: [
    { kind: 'course-page', key: 'page-1', pdfPage: 1 },
    { kind: 'quiz', key: 'quiz-1', quizId: 'q1', title: 'Quiz', questionCount: 3, afterPage: 1 },
    { kind: 'leaderboard', key: 'lb-1', leaderboardId: 'lb1', title: 'Classement', afterPage: 1 },
    { kind: 'course-page', key: 'page-2', pdfPage: 2 },
  ],
}

const presenting = (index = 0, quizRunning = false): PresentationState => ({ status: 'presenting', plan, index, quizRunning })

describe('presentationReducer', () => {
  it('Chargement → EnPresentation à la position de départ quand le plan est reçu', () => {
    const state = presentationReducer(initialPresentationState, { type: 'PLAN_RECEIVED', plan: { ...plan, startIndex: 3 } })
    expect(state).toMatchObject({ status: 'presenting', index: 3, quizRunning: false })
  })

  it('borne la position de reprise au plan', () => {
    const state = presentationReducer(initialPresentationState, { type: 'PLAN_RECEIVED', plan: { ...plan, startIndex: 99 } })
    expect(state).toMatchObject({ index: 3 })
  })

  it('Chargement → Refusée quand un contrôle échoue', () => {
    const error = new AppError('FORBIDDEN')
    expect(presentationReducer(initialPresentationState, { type: 'CONTROL_FAILED', error })).toEqual({ status: 'refused', error })
  })

  it('navigue suivant / précédent / premier / dernier / page n en restant dans les bornes', () => {
    const next = (s: PresentationState, target: Parameters<typeof presentationReducer>[1]) => presentationReducer(s, target)
    expect(next(presenting(0), { type: 'NAVIGATE', target: { kind: 'next' } })).toMatchObject({ index: 1 })
    expect(next(presenting(0), { type: 'NAVIGATE', target: { kind: 'previous' } })).toMatchObject({ index: 0 })
    expect(next(presenting(3), { type: 'NAVIGATE', target: { kind: 'next' } })).toMatchObject({ index: 3 })
    expect(next(presenting(2), { type: 'NAVIGATE', target: { kind: 'first' } })).toMatchObject({ index: 0 })
    expect(next(presenting(0), { type: 'NAVIGATE', target: { kind: 'last' } })).toMatchObject({ index: 3 })
    expect(next(presenting(0), { type: 'NAVIGATE', target: { kind: 'index', index: 2 } })).toMatchObject({ index: 2 })
  })

  it('ne lance un quiz que depuis une page de quiz', () => {
    expect(presentationReducer(presenting(0), { type: 'LAUNCH_QUIZ' })).toMatchObject({ quizRunning: false })
    expect(presentationReducer(presenting(1), { type: 'LAUNCH_QUIZ' })).toMatchObject({ quizRunning: true })
  })

  it('bloque la navigation pendant QuizEnCours jusqu’à la clôture du quiz', () => {
    const running = presenting(1, true)
    expect(presentationReducer(running, { type: 'NAVIGATE', target: { kind: 'next' } })).toBe(running)
    const closed = presentationReducer(running, { type: 'QUIZ_CLOSED' })
    expect(closed).toMatchObject({ quizRunning: false, index: 1 })
    expect(presentationReducer(closed, { type: 'NAVIGATE', target: { kind: 'next' } })).toMatchObject({ index: 2 })
  })

  it('EnPresentation → Interrompue → EnPresentation en conservant la position', () => {
    const error = new AppError('NETWORK')
    const interrupted = presentationReducer(presenting(2), { type: 'CONNECTION_LOST', error })
    expect(interrupted).toMatchObject({ status: 'interrupted', index: 2, error })
    expect(presentationReducer(interrupted, { type: 'NAVIGATE', target: { kind: 'next' } })).toBe(interrupted)
    expect(presentationReducer(interrupted, { type: 'CONNECTION_RESTORED' })).toMatchObject({ status: 'presenting', index: 2 })
  })

  it('termine depuis EnPresentation (y compris quiz en cours) et depuis Interrompue', () => {
    expect(presentationReducer(presenting(1, true), { type: 'END' })).toEqual({ status: 'ended' })
    const interrupted = presentationReducer(presenting(0), { type: 'CONNECTION_LOST', error: new AppError('NETWORK') })
    expect(presentationReducer(interrupted, { type: 'END' })).toEqual({ status: 'ended' })
  })

  it('les états terminaux ignorent les événements', () => {
    const ended: PresentationState = { status: 'ended' }
    expect(presentationReducer(ended, { type: 'NAVIGATE', target: { kind: 'next' } })).toBe(ended)
  })
})

describe('phaseOf', () => {
  it('dérive le sous-état de EnPresentation', () => {
    expect(phaseOf(presenting(0))).toBe('course-page')
    expect(phaseOf(presenting(1))).toBe('quiz-page')
    expect(phaseOf(presenting(1, true))).toBe('quiz-running')
    expect(phaseOf(presenting(2))).toBe('leaderboard-page')
    expect(phaseOf(initialPresentationState)).toBeUndefined()
  })
})
