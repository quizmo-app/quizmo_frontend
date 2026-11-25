import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { paths, type FlashState } from '@/shared/routing/paths'
import { enterFullscreen, exitFullscreen, useFullscreen } from '@/shared/ui/fullscreen'
import { useCoursePage } from '../application/useCoursePage'
import { usePresentation } from '../application/usePresentation'
import type { PresentationRepository } from '../domain/PresentationRepository'
import { isFirst, isLast, itemLabel } from '../domain/planQueries'
import { CoursePageView } from './components/CoursePageView'
import { LeaderboardSlide } from './components/LeaderboardSlide'
import { PlanPanel } from './components/PlanPanel'
import { PresentationToolbar } from './components/PresentationToolbar'
import { QuizRunningPlaceholder, QuizSlide } from './components/QuizSlide'
import { InterruptedOverlay, LoadingScreen, RefusedScreen, ResumeToast } from './components/StatusScreens'
import { useIdle } from './hooks/useIdle'
import { usePresenterKeyboard } from './hooks/usePresenterKeyboard'

const RESUME_TOAST_MS = 4000

/** CU2.1 — Présenter un cours : vue plein écran pilotée par la couche Application. */
export function PresentationPage({ repository }: { repository: PresentationRepository }) {
  const { courseId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const presentation = usePresentation(repository, courseId)
  const { state, plan, index, phase, currentItem, end } = presentation
  const active = state.status === 'presenting' || state.status === 'interrupted'

  const page = useCoursePage({
    repository,
    plan,
    index,
    enabled: state.status === 'presenting',
    onFailure: presentation.reportFailure,
  })

  const [planOpen, setPlanOpen] = useState(false)
  const idle = useIdle()

  // Quitter le plein écran (touche Échap) = « l'enseignant termine ».
  const endIfActive = useCallback(() => {
    if (active) void end()
  }, [active, end])
  const isFullscreen = useFullscreen(endIfActive)

  usePresenterKeyboard({
    enabled: state.status === 'presenting' && !state.quizRunning,
    onNavigate: presentation.navigate,
    onEnd: () => (active ? void end() : navigate(paths.dashboard)),
    onTogglePlan: () => setPlanOpen((open) => !open),
  })

  // ── Transitions de sortie : Terminée → tableau de bord ; 401 → connexion (CU1.1) ──
  const courseTitleRef = useRef<string | null>(null)
  if (plan) courseTitleRef.current = plan.course.title
  useEffect(() => {
    if (state.status === 'ended') {
      exitFullscreen()
      const flash: FlashState = {
        flash: { tone: 'success', message: `Présentation « ${courseTitleRef.current ?? 'du cours'} » terminée.` },
      }
      navigate(paths.dashboard, { replace: true, state: flash })
    } else if (state.status === 'refused') {
      exitFullscreen()
      if (state.error.code === 'UNAUTHENTICATED') navigate(paths.login(location.pathname), { replace: true })
    }
  }, [state, navigate, location.pathname])

  // ── Bandeau de reprise ──
  const [showResume, setShowResume] = useState(false)
  const resumed = plan?.resumed ?? false
  useEffect(() => {
    if (!resumed) return
    setShowResume(true)
    const timer = setTimeout(() => setShowResume(false), RESUME_TOAST_MS)
    return () => clearTimeout(timer)
  }, [resumed])

  const goTo = (target: number) => {
    presentation.navigate({ kind: 'index', index: target })
    setPlanOpen(false)
  }

  return (
    // Thème « Session live » (sombre, violet profond) : écran projeté en salle.
    <div
      data-theme="live"
      className={`relative h-dvh w-full select-none overflow-hidden bg-surface-100 text-ink ${idle && !planOpen ? 'cursor-none' : ''}`}
    >
      {state.status === 'loading' && <LoadingScreen />}

      {state.status === 'refused' && state.error.code !== 'UNAUTHENTICATED' && (
        <RefusedScreen error={state.error} onBack={() => navigate(paths.dashboard)} />
      )}

      {plan && currentItem && (
        <>
          <main className="absolute inset-0 p-(--space-7)" aria-live="polite">
            {phase === 'course-page' && <CoursePageView page={page.current} next={page.next} onRetry={page.retry} />}
            {phase === 'quiz-page' && currentItem.kind === 'quiz' && (
              <QuizSlide quiz={currentItem} onLaunch={presentation.launchQuiz} disabled={state.status !== 'presenting'} />
            )}
            {phase === 'quiz-running' && currentItem.kind === 'quiz' && (
              <QuizRunningPlaceholder quiz={currentItem} onClose={presentation.closeQuiz} />
            )}
            {phase === 'leaderboard-page' && currentItem.kind === 'leaderboard' && (
              <LeaderboardSlide key={currentItem.key} leaderboard={currentItem} />
            )}
          </main>

          {showResume && <ResumeToast label={itemLabel(currentItem)} />}

          <PlanPanel
            plan={plan}
            currentIndex={index}
            open={planOpen}
            locked={phase === 'quiz-running' || state.status !== 'presenting'}
            onSelect={goTo}
            onClose={() => setPlanOpen(false)}
          />

          <PresentationToolbar
            position={index + 1}
            total={plan.items.length}
            label={itemLabel(currentItem)}
            hidden={idle && !planOpen}
            navigationLocked={phase === 'quiz-running' || state.status !== 'presenting'}
            canGoBack={!isFirst(index)}
            canGoForward={!isLast(plan, index)}
            isFullscreen={isFullscreen}
            onNavigate={presentation.navigate}
            onTogglePlan={() => setPlanOpen((open) => !open)}
            onEnterFullscreen={enterFullscreen}
            onEnd={() => void end()}
          />

          {state.status === 'interrupted' && (
            <InterruptedOverlay
              error={state.error}
              onRetry={presentation.resume}
              onReconnect={() => navigate(paths.login(location.pathname))}
              onEnd={() => void end()}
            />
          )}
        </>
      )}
    </div>
  )
}
