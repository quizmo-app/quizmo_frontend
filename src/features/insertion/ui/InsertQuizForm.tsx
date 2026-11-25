import { defaultMessages } from '@/shared/domain/AppError'
import { Button } from '@/shared/ui/Button'
import { useInsertQuiz } from '../application/useInsertQuiz'
import type { Insertion } from '../domain/Insertion'
import type { InsertionRepository } from '../domain/InsertionRepository'

/** Insère un quiz déjà créé après une page du cours (CU1.4) : pas de catalogue des quiz non insérés, juste un id. */
export function InsertQuizForm({
  repository,
  courseId,
  pageCount,
  initialAfterPage,
  onInserted,
}: {
  repository: InsertionRepository
  courseId: string
  pageCount: number
  /** Page présélectionnée (ex. miniature choisie sur la page du cours). */
  initialAfterPage?: number
  onInserted: (insertion: Insertion) => void
}) {
  const { quizId, setQuizId, afterPage, setAfterPage, quizIdError, positionError, state, submit } = useInsertQuiz(
    repository,
    courseId,
    pageCount,
    onInserted,
    initialAfterPage,
  )
  const pending = state.status === 'loading'

  return (
    <form onSubmit={submit} className="flex flex-col gap-(--space-3) rounded-md border border-border bg-surface-200 p-(--space-5) shadow-card">
      <h3 className="typo-h2 text-ink">Insérer un quiz existant</h3>

      <label htmlFor="insert-quiz-id" className="typo-label text-ink-muted">
        Identifiant du quiz
      </label>
      <input
        id="insert-quiz-id"
        value={quizId}
        onChange={(event) => setQuizId(event.target.value)}
        disabled={pending}
        className="rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />
      {quizIdError && <p role="alert" className="typo-body-small text-danger">{defaultMessages[quizIdError]}</p>}

      <label htmlFor="insert-after-page" className="typo-label text-ink-muted">
        Après la page
      </label>
      <input
        id="insert-after-page"
        type="number"
        min={0}
        max={pageCount}
        value={afterPage}
        onChange={(event) => setAfterPage(Number(event.target.value))}
        disabled={pending}
        className="w-32 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />
      {positionError && <p role="alert" className="typo-body-small text-danger">{defaultMessages[positionError]}</p>}

      {state.status === 'error' && (
        <p role="alert" className="rounded-sm bg-danger px-(--space-3) py-(--space-2) typo-body-small text-danger-ink">
          {state.error.message}
        </p>
      )}
      {state.status === 'success' && (
        <p className="typo-body-small text-success">
          Quiz {state.data.quizId} inséré après la page {state.data.afterPage} (ordre {state.data.order}).
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Insertion…' : 'Insérer'}
        </Button>
      </div>
    </form>
  )
}
