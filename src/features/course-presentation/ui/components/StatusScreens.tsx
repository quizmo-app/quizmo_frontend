import type { AppError } from '@/shared/domain/AppError'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'

/** État « Chargement » : contrôles serveur + construction du plan. */
export function LoadingScreen() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-(--space-4)">
      <Spinner className="size-10 text-brand" label="Préparation de la présentation" />
      <p className="typo-body text-ink-muted">Préparation de la présentation…</p>
    </div>
  )
}

/** État « Refusée » : contrôle en échec (403, 404, cours archivé, PDF indisponible…). */
export function RefusedScreen({ error, onBack }: { error: AppError; onBack: () => void }) {
  return (
    <div className="flex size-full items-center justify-center p-(--space-7)">
      <div role="alert" className="w-full max-w-md rounded-lg border border-border bg-surface-200 p-(--space-6) text-center">
        <span className="typo-label text-danger">Présentation refusée</span>
        <h1 className="mt-(--space-3) typo-h2 text-ink">Ce cours ne peut pas être présenté</h1>
        <p className="mt-(--space-2) typo-body text-ink-muted">{error.message}</p>
        <Button className="mt-(--space-5) w-full" onClick={onBack}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}

/** État « Interrompue » : coupure réseau ou session expirée en cours de présentation. */
export function InterruptedOverlay({
  error,
  onRetry,
  onReconnect,
  onEnd,
}: {
  error: AppError
  onRetry: () => void
  onReconnect: () => void
  onEnd: () => void
}) {
  const sessionExpired = error.code === 'UNAUTHENTICATED'
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-300/80 p-(--space-7)">
      <div
        role="alertdialog"
        aria-labelledby="interrupted-title"
        aria-describedby="interrupted-description"
        className="w-full max-w-md rounded-lg border border-border bg-surface-200 p-(--space-6) text-center"
      >
        <span className="typo-label text-danger">{sessionExpired ? 'Session expirée' : 'Connexion perdue'}</span>
        <h2 id="interrupted-title" className="mt-(--space-3) typo-h2 text-ink">
          Présentation interrompue
        </h2>
        <p id="interrupted-description" className="mt-(--space-2) typo-body text-ink-muted">
          {error.message} Votre page est conservée : vous reprendrez exactement là où vous en étiez.
        </p>
        <div className="mt-(--space-5) flex flex-col gap-(--space-2)">
          {sessionExpired ? (
            <Button onClick={onReconnect}>Se reconnecter</Button>
          ) : (
            <Button onClick={onRetry}>Reprendre la présentation</Button>
          )}
          <Button variant="ghost" onClick={onEnd}>
            Quitter la présentation
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Bandeau informant de la reprise à la dernière page enregistrée. */
export function ResumeToast({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="absolute left-1/2 top-(--space-5) z-10 -translate-x-1/2 rounded-full border border-brand bg-surface-200 px-(--space-5) py-(--space-2) typo-body-small text-ink"
    >
      Reprise là où vous en étiez · {label}
    </div>
  )
}
