import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Modale accessible basée sur <dialog> natif (piège du focus, Échap, inertie du fond).
 * Charte : radius-lg, marge extérieure space-6, apparition instantanée.
 */
export function Dialog({
  open,
  title,
  onClose,
  children,
  actions,
  role = 'dialog',
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  actions: ReactNode
  /** `alertdialog` pour une confirmation d'action irréversible. */
  role?: 'dialog' | 'alertdialog'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(100%-2*var(--space-5),32rem)] rounded-lg border border-border bg-surface-200 p-(--space-6) text-ink shadow-card backdrop:bg-ink/40"
    >
      {open && (
        <>
          <h2 id={titleId} className="typo-h2 text-ink">
            {title}
          </h2>
          <div className="mt-(--space-3) typo-body text-ink-muted">{children}</div>
          <div className="mt-(--space-5) flex flex-wrap justify-end gap-(--space-2)">{actions}</div>
        </>
      )}
    </dialog>
  )
}
