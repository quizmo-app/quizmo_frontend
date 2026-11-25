import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AppError } from '@/shared/domain/AppError'
import { safeRedirect } from '@/shared/routing/paths'
import { Button } from '@/shared/ui/Button'
import { Wordmark } from '@/shared/ui/Wordmark'
import type { SessionGateway } from '../domain/SessionGateway'

/**
 * Placeholder du CU1.1 (Se connecter), cible de la redirection après un 401.
 * Le vrai formulaire de connexion sera livré avec le CU1.1.
 */
export function LoginPage({ gateway }: { gateway: SessionGateway }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirectTo = safeRedirect(params.get('redirection'))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const signIn = async () => {
    setPending(true)
    setError(null)
    try {
      await gateway.signIn()
      navigate(redirectTo, { replace: true })
    } catch (e) {
      setError(AppError.from(e))
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-100 p-(--space-6)">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface-200 p-(--space-6) shadow-card">
        <Wordmark />
        <h1 className="mt-(--space-5) typo-h2 text-ink">Connexion</h1>
        <p className="mt-(--space-2) typo-body text-ink-muted">
          Connectez-vous pour reprendre là où vous en étiez. Le formulaire de connexion sera livré avec le CU1.1.
        </p>
        {error && (
          <p role="alert" className="mt-(--space-4) rounded-sm bg-danger px-(--space-3) py-(--space-2) typo-body-small text-danger-ink">
            {error.message}
          </p>
        )}
        <Button className="mt-(--space-5) w-full" onClick={signIn} disabled={pending}>
          {pending ? 'Connexion…' : 'Se connecter avec le compte de démonstration'}
        </Button>
      </div>
    </div>
  )
}
