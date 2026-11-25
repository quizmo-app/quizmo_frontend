import { useId } from 'react'
import { Badge } from '@/shared/ui/Badge'
import type { Insertion } from '../../domain/CourseStructure'

/**
 * Emplacement d'un quiz ou d'un classement « après la page n ».
 * Déplacement au clavier ou à la souris : flèches (cran par cran) ou choix direct de la page.
 */
export function InsertionChip({
  insertion,
  pageCount,
  readOnly,
  canShiftBack,
  canShiftForward,
  onShift,
  onMove,
}: {
  insertion: Insertion
  pageCount: number
  readOnly: boolean
  canShiftBack: boolean
  canShiftForward: boolean
  onShift: (direction: -1 | 1) => void
  onMove: (afterPage: number) => void
}) {
  const selectId = useId()
  const isQuiz = insertion.kind === 'quiz'

  return (
    <li
      className="rounded-sm border-2 border-brand bg-surface-200 p-(--space-3)"
    >
      <div className="flex flex-wrap items-center gap-(--space-2)">
        <Badge tone={isQuiz ? 'brand' : 'neutral'}>{isQuiz ? 'Quiz' : 'Classement'}</Badge>
      </div>
      <p className="mt-(--space-2) typo-body font-bold text-ink">{insertion.title}</p>
      {isQuiz && insertion.questionCount !== undefined && (
        <p className="typo-body-small text-ink-muted">
          {insertion.questionCount} question{insertion.questionCount > 1 ? 's' : ''}
        </p>
      )}

      {!readOnly && (
        <div className="mt-(--space-3) flex flex-wrap items-end gap-(--space-2)">
          <div className="min-w-0 flex-1">
            <label htmlFor={selectId} className="typo-label text-ink-muted">
              Après la page
            </label>
            <select
              id={selectId}
              value={insertion.afterPage}
              onChange={(event) => onMove(Number(event.target.value))}
              className="mt-(--space-1) block w-full rounded-sm border border-border bg-surface-300 px-(--space-2) py-(--space-1) typo-body-small text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {Array.from({ length: pageCount + 1 }, (_, i) => i).map((page) => (
                <option key={page} value={page}>
                  {page === 0 ? 'Avant la page 1' : page}
                </option>
              ))}
            </select>
          </div>
          <ShiftButton label={`Placer « ${insertion.title} » plus tôt`} disabled={!canShiftBack} onClick={() => onShift(-1)}>
            ↑
          </ShiftButton>
          <ShiftButton
            label={`Placer « ${insertion.title} » plus tard`}
            disabled={!canShiftForward}
            onClick={() => onShift(1)}
          >
            ↓
          </ShiftButton>
        </div>
      )}
    </li>
  )
}

function ShiftButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="typo-button inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-200 text-ink hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-48"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}
