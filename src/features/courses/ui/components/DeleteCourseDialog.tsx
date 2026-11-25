import type { AppError } from '@/shared/domain/AppError'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'

/** EF-07 : confirmation explicite avant suppression définitive (purge RGPD). */
export function DeleteCourseDialog({
  course,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  course: { title: string } | null
  deleting: boolean
  error: AppError | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={course !== null}
      role="alertdialog"
      title="Supprimer ce cours ?"
      onClose={onCancel}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Conserver le cours
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Suppression…' : 'Supprimer définitivement'}
          </Button>
        </>
      }
    >
      <p>
        <strong className="text-ink">« {course?.title} »</strong> sera supprimé avec toutes ses versions PDF, ses quiz,
        ses classements et les résultats des étudiants.
      </p>
      <p className="mt-(--space-2)">Cette suppression est définitive : le cours ne pourra pas être restauré.</p>
      {error && (
        <p role="alert" className="mt-(--space-4) rounded-sm bg-danger px-(--space-3) py-(--space-2) typo-body-small text-danger-ink">
          {error.message}
        </p>
      )}
    </Dialog>
  )
}
