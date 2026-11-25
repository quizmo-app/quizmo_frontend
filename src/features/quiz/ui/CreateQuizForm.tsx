import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { useCreateQuiz } from '../application/useCreateQuiz'
import type { Quiz } from '../domain/Quiz'
import type { QuizRepository } from '../domain/QuizRepository'
import { McqQuestionForm } from './McqQuestionForm'
import { OpenQuestionForm } from './OpenQuestionForm'

/** Éditeur de quiz (CU1.3/CU1.4) : titre, position, questions QCM/réponse libre, puis enregistrement. */
export function CreateQuizForm({
  repository,
  courseId,
  pageCount,
  initialAfterPage,
  onCreated,
  onCancel,
}: {
  repository: QuizRepository
  courseId: string
  pageCount: number
  initialAfterPage: number
  onCreated: (quiz: Quiz) => void
  onCancel: () => void
}) {
  const {
    title,
    setTitle,
    defaultDurationSeconds,
    setDefaultDurationSeconds,
    afterPage,
    setAfterPage,
    questions,
    addMcqQuestion,
    addOpenQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    errors,
    state,
    submit,
  } = useCreateQuiz(repository, courseId, pageCount, initialAfterPage, onCreated)

  const [confirmCancel, setConfirmCancel] = useState(false)
  const pending = state.status === 'loading'
  const invalidQuestionCount = Object.keys(errors.byQuestion).length

  function requestCancel() {
    if (title.trim().length === 0 && questions.length === 0) {
      onCancel()
      return
    }
    setConfirmCancel(true)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-(--space-3) rounded-md border border-border bg-surface-200 p-(--space-5) shadow-card">
      <h2 className="typo-h2 text-ink">Insérer un quiz</h2>

      <label htmlFor="quiz-title" className="typo-label text-ink-muted">
        Titre du quiz
      </label>
      <input
        id="quiz-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={pending}
        className="rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />
      {errors.title && <p role="alert" className="typo-body-small text-danger">Ce champ est obligatoire.</p>}

      <label htmlFor="quiz-after-page" className="typo-label text-ink-muted">
        Après la page
      </label>
      <input
        id="quiz-after-page"
        type="number"
        min={0}
        max={pageCount}
        value={afterPage}
        onChange={(event) => setAfterPage(Number(event.target.value))}
        disabled={pending}
        className="w-32 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />
      {errors.position && <p role="alert" className="typo-body-small text-danger">La position choisie est hors du cours.</p>}

      <label htmlFor="quiz-default-duration" className="typo-label text-ink-muted">
        Durée par défaut des questions (secondes)
      </label>
      <input
        id="quiz-default-duration"
        type="number"
        value={defaultDurationSeconds}
        onChange={(event) => setDefaultDurationSeconds(Number(event.target.value))}
        disabled={pending}
        className="w-32 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />

      {errors.quiz && <p role="alert" className="typo-body-small text-danger">Un quiz doit contenir au moins une question.</p>}

      <div className="flex flex-col gap-(--space-4)">
        {questions.map((question, index) =>
          question.type === 'MCQ' ? (
            <McqQuestionForm
              key={question.id}
              question={question}
              index={index}
              errors={errors.byQuestion[question.id] ?? []}
              onChange={(updated) => updateQuestion(question.id, updated)}
              onRemove={() => removeQuestion(question.id)}
              onMoveUp={() => moveQuestion(index, -1)}
              onMoveDown={() => moveQuestion(index, 1)}
            />
          ) : (
            <OpenQuestionForm
              key={question.id}
              question={question}
              index={index}
              errors={errors.byQuestion[question.id] ?? []}
              onChange={(updated) => updateQuestion(question.id, updated)}
              onRemove={() => removeQuestion(question.id)}
              onMoveUp={() => moveQuestion(index, -1)}
              onMoveDown={() => moveQuestion(index, 1)}
            />
          ),
        )}
      </div>

      <div className="flex flex-wrap gap-(--space-3)">
        <Button type="button" variant="secondary" onClick={addMcqQuestion} disabled={pending}>
          + Question QCM
        </Button>
        <Button type="button" variant="secondary" onClick={addOpenQuestion} disabled={pending}>
          + Question réponse libre
        </Button>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="rounded-sm bg-danger px-(--space-3) py-(--space-2) typo-body-small text-danger-ink">
          {state.error.message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
        {invalidQuestionCount > 0 && (
          <span className="typo-body-small font-bold text-danger">
            {invalidQuestionCount} question{invalidQuestionCount > 1 ? 's' : ''} à corriger
          </span>
        )}

        {confirmCancel ? (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-(--space-2)">
            <span className="typo-body-small text-ink">Annuler la saisie ? Rien ne sera enregistré.</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmCancel(false)}>
              Non
            </Button>
            <Button type="button" variant="accent" size="sm" onClick={onCancel}>
              Oui, annuler
            </Button>
          </div>
        ) : (
          <div className="ml-auto flex gap-(--space-3)">
            <Button type="button" variant="secondary" onClick={requestCancel} disabled={pending}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
