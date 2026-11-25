import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/Button'
import type { QuizItem } from '../../domain/PresentationPlan'

/** État « PageQuiz » : étape « 1. LANCER », propose de lancer le quiz (→ CU2.2). */
export function QuizSlide({ quiz, onLaunch, disabled }: { quiz: QuizItem; onLaunch: () => void; disabled?: boolean }) {
  return (
    <StageFrame step="1. LANCER">
      <h2 className="typo-display-xl text-ink">{quiz.title}</h2>
      <p className="mt-(--space-4) typo-h2 text-ink-muted">
        {quiz.questionCount} question{quiz.questionCount > 1 ? 's' : ''}
      </p>
      <Button variant="accent" size="lg" className="mt-(--space-7)" onClick={onLaunch} disabled={disabled}>
        Lancer le quiz
      </Button>
    </StageFrame>
  )
}

/**
 * État « QuizEnCours » : étape « 2. RÉPONDRE », emplacement réservé au CU2.2.
 * Seule la clôture du quiz permet de reprendre la navigation.
 */
export function QuizRunningPlaceholder({ quiz, onClose }: { quiz: QuizItem; onClose: () => void }) {
  return (
    <StageFrame step="2. RÉPONDRE" dashed>
      <h2 className="typo-display-lg text-ink">{quiz.title}</h2>
      <p className="mt-(--space-4) max-w-xl typo-body text-ink-muted">
        Le déroulement du quiz (code PIN, compte à rebours, réponses) sera fourni par le CU2.2. Clôturez le quiz pour
        reprendre la navigation dans le cours.
      </p>
      <Button variant="secondary" size="lg" className="mt-(--space-7)" onClick={onClose}>
        Clôturer le quiz
      </Button>
    </StageFrame>
  )
}

/** Conteneur plein écran de séance : surface-200, radius-lg, étiquette d'étape en style `label`. */
export function StageFrame({
  step,
  dashed = false,
  children,
}: {
  step: string
  dashed?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex size-full items-center justify-center">
      <div
        className={`flex aspect-video w-full max-w-6xl flex-col items-center justify-center rounded-lg border bg-surface-200 p-(--space-7) text-center ${dashed ? 'border-dashed border-brand' : 'border-border'}`}
      >
        <span className="typo-label text-accent">{step}</span>
        <div className="mt-(--space-5) flex flex-col items-center">{children}</div>
      </div>
    </div>
  )
}
