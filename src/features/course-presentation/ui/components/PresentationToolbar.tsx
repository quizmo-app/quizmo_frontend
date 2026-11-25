import { useState, type FormEvent, type ReactNode } from 'react'
import type { NavigationTarget } from '../../domain/presentationMachine'

/**
 * Barre de contrôle du présentateur, masquée après inactivité de la souris.
 * Apparition/disparition instantanées (charte : seule l'animation de classement est prolongée).
 */
export function PresentationToolbar({
  position,
  total,
  label,
  hidden,
  navigationLocked,
  canGoBack,
  canGoForward,
  isFullscreen,
  onNavigate,
  onTogglePlan,
  onEnterFullscreen,
  onEnd,
}: {
  position: number
  total: number
  label: string
  hidden: boolean
  navigationLocked: boolean
  canGoBack: boolean
  canGoForward: boolean
  isFullscreen: boolean
  onNavigate: (target: NavigationTarget) => void
  onTogglePlan: () => void
  /** Quitter le plein écran (Échap) termine la présentation : seul le passage en plein écran est proposé. */
  onEnterFullscreen: () => void
  onEnd: () => void
}) {
  const [editing, setEditing] = useState(false)

  const submitGoTo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = Number(new FormData(event.currentTarget).get('position'))
    if (Number.isFinite(value) && value >= 1) onNavigate({ kind: 'index', index: value - 1 })
    setEditing(false)
  }

  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-(--space-5) ${hidden ? 'invisible' : ''}`}>
      <nav
        aria-label="Contrôles de la présentation"
        className="pointer-events-auto flex items-center gap-(--space-1) rounded-full border border-border bg-surface-200 p-(--space-2) shadow-stage"
      >
        <ToolbarButton label="Sommaire (P)" onClick={onTogglePlan}>
          <path d="M3 5h14M3 10h14M3 15h14" />
        </ToolbarButton>
        <ToolbarButton
          label="Page précédente (←)"
          onClick={() => onNavigate({ kind: 'previous' })}
          disabled={navigationLocked || !canGoBack}
        >
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </ToolbarButton>

        <div className="min-w-44 px-(--space-3) text-center">
          {editing ? (
            <form onSubmit={submitGoTo} className="flex items-center justify-center gap-(--space-2)">
              <label htmlFor="goto-position" className="sr-only">
                Aller à la page
              </label>
              <input
                id="goto-position"
                name="position"
                type="number"
                min={1}
                max={total}
                defaultValue={position}
                autoFocus
                onBlur={() => setEditing(false)}
                onKeyDown={(event) => {
                  // Échap annule la saisie (le raccourci global ignore les champs de saisie).
                  if (event.key === 'Escape') setEditing(false)
                }}
                className="w-16 rounded-sm bg-surface-300 px-(--space-2) py-(--space-1) text-center typo-body text-ink tabular-nums focus-visible:outline-2 focus-visible:outline-focus-ring"
              />
              <span className="typo-body text-ink-muted">/ {total}</span>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={navigationLocked}
              className="rounded-full px-(--space-3) py-(--space-1) hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-48 disabled:hover:bg-transparent"
              title="Aller à la page n (ou tapez le numéro puis Entrée)"
            >
              <span className="block typo-button text-ink tabular-nums">
                {position} <span className="text-ink-muted">/ {total}</span>
              </span>
              <span className="block max-w-48 truncate typo-body-small text-ink-muted">{label}</span>
            </button>
          )}
        </div>

        <ToolbarButton
          label="Page suivante (→)"
          onClick={() => onNavigate({ kind: 'next' })}
          disabled={navigationLocked || !canGoForward}
        >
          <path d="M7.5 4.5 13 10l-5.5 5.5" />
        </ToolbarButton>
        {!isFullscreen && (
          <ToolbarButton label="Plein écran" onClick={onEnterFullscreen}>
            <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" />
          </ToolbarButton>
        )}
        <span className="mx-(--space-1) h-6 w-px bg-border" />
        <button
          type="button"
          onClick={onEnd}
          className="h-10 rounded-full border border-border px-(--space-4) typo-button text-ink hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-focus-ring"
          title="Terminer la présentation (Échap)"
        >
          Terminer
        </button>
      </nav>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full p-(--space-2) text-ink hover:bg-surface-300 focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-48 disabled:hover:bg-transparent"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}
