import type { AppErrorCode } from '@/shared/domain/AppError'
import { defaultMessages } from '@/shared/domain/AppError'
import { Button } from '@/shared/ui/Button'
import type { McqOption, McqQuestion } from '../domain/Quiz'

export function McqQuestionForm({
  question,
  index,
  errors,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  question: McqQuestion
  index: number
  errors: AppErrorCode[]
  onChange: (question: McqQuestion) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  function updateOption(optionId: string, fields: Partial<McqOption>) {
    onChange({ ...question, options: question.options.map((option) => (option.id === optionId ? { ...option, ...fields } : option)) })
  }

  function toggleCorrect(optionId: string, correct: boolean) {
    if (question.allowMultiple) {
      updateOption(optionId, { correct })
    } else {
      onChange({ ...question, options: question.options.map((option) => ({ ...option, correct: option.id === optionId ? correct : false })) })
    }
  }

  function addOption() {
    if (question.options.length >= 8) return
    onChange({ ...question, options: [...question.options, { id: crypto.randomUUID(), label: '', correct: false }] })
  }

  function removeOption(optionId: string) {
    if (question.options.length <= 2) return
    onChange({ ...question, options: question.options.filter((option) => option.id !== optionId) })
  }

  function toggleAllowMultiple(allowMultiple: boolean) {
    if (allowMultiple) {
      onChange({ ...question, allowMultiple })
      return
    }
    const firstCorrectId = question.options.find((option) => option.correct)?.id
    onChange({
      ...question,
      allowMultiple,
      options: question.options.map((option) => ({ ...option, correct: option.id === firstCorrectId })),
    })
  }

  return (
    <fieldset className={`flex flex-col gap-(--space-2) rounded-md border p-(--space-4) ${errors.length > 0 ? 'border-danger' : 'border-border'}`}>
      <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
        <legend className="typo-h2 text-ink">Question {index + 1} · QCM</legend>
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
        <input
          type="checkbox"
          checked={question.allowMultiple}
          onChange={(event) => toggleAllowMultiple(event.target.checked)}
        />
        Choix multiple
      </label>

      {question.options.map((option) => (
        <div key={option.id} className="flex items-center gap-(--space-2)">
          <input
            type={question.allowMultiple ? 'checkbox' : 'radio'}
            name={`correct-${question.id}`}
            checked={option.correct}
            onChange={(event) => toggleCorrect(option.id, event.target.checked)}
          />
          <input
            value={option.label}
            onChange={(event) => updateOption(option.id, { label: event.target.value })}
            placeholder="Libellé de la réponse"
            className="flex-1 rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => removeOption(option.id)} disabled={question.options.length <= 2}>
            Retirer
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addOption} disabled={question.options.length >= 8}>
        Ajouter une option
      </Button>

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
