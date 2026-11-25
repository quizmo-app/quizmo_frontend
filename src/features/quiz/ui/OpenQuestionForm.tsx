import type { AppErrorCode } from '@/shared/domain/AppError'
import { defaultMessages } from '@/shared/domain/AppError'
import { Button } from '@/shared/ui/Button'
import type { OpenQuestion } from '../domain/Quiz'

export function OpenQuestionForm({
  question,
  index,
  errors,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  question: OpenQuestion
  index: number
  errors: AppErrorCode[]
  onChange: (question: OpenQuestion) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  function updateAnswer(answerIndex: number, value: string) {
    onChange({ ...question, acceptedAnswers: question.acceptedAnswers.map((answer, i) => (i === answerIndex ? value : answer)) })
  }

  function addAnswer() {
    onChange({ ...question, acceptedAnswers: [...question.acceptedAnswers, ''] })
  }

  function removeAnswer(answerIndex: number) {
    onChange({ ...question, acceptedAnswers: question.acceptedAnswers.filter((_, i) => i !== answerIndex) })
  }

  return (
    <fieldset className={`flex flex-col gap-(--space-2) rounded-md border p-(--space-4) ${errors.length > 0 ? 'border-danger' : 'border-border'}`}>
      <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
        <legend className="typo-h2 text-ink">Question {index + 1} · Réponse libre</legend>
        <div className="flex gap-(--space-2)">
          <Button type="button" variant="secondary" size="sm" onClick={onMoveUp}>
            ↑
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onMoveDown}>
            ↓
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onRemove}>
            Retirer la question
          </Button>
        </div>
      </div>

      <label className="typo-label text-ink-muted">Énoncé</label>
      <input
        value={question.statement}
        onChange={(event) => onChange({ ...question, statement: event.target.value })}
        className="rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />

      <label className="typo-label text-ink-muted">Durée (secondes)</label>
      <input
        type="number"
        value={question.durationSeconds}
        onChange={(event) => onChange({ ...question, durationSeconds: Number(event.target.value) })}
        className="w-32 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />

      <label className="flex items-center gap-(--space-2) typo-body text-ink">
        <input type="checkbox" checked={question.graded} onChange={(event) => onChange({ ...question, graded: event.target.checked })} />
        Notée
      </label>

      {question.graded && (
        <>
          <label className="typo-label text-ink-muted">Réponses acceptées</label>
          {question.acceptedAnswers.map((answer, i) => (
            <div key={i} className="flex items-center gap-(--space-2)">
              <input
                value={answer}
                onChange={(event) => updateAnswer(i, event.target.value)}
                className="flex-1 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
              />
              <Button type="button" variant="secondary" size="sm" onClick={() => removeAnswer(i)} disabled={question.acceptedAnswers.length <= 1}>
                Retirer
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addAnswer}>
            Ajouter une réponse acceptée
          </Button>
        </>
      )}

      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-(--space-5) typo-body-small text-danger">
          {errors.map((code) => (
            <li key={code}>{defaultMessages[code]}</li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}
