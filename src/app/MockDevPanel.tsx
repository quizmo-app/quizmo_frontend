import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/routing/paths'
import { Button } from '@/shared/ui/Button'
import { enterFullscreen } from '@/shared/ui/fullscreen'
import type { DevTools } from './di/container'

/** Panneau visible uniquement en mode mock : déclenche les scénarios non accessibles depuis la liste. */
export function MockDevPanel({ devTools, onDataChanged }: { devTools: DevTools; onDataChanged: () => void }) {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <section
      className="rounded-md border border-dashed border-border bg-surface-300 p-(--space-4)"
      aria-label="Scénarios de démonstration"
    >
      <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
        <h2 className="typo-label text-ink-muted">Mode démonstration · scénarios de test</h2>
        <span className="typo-body-small text-ink-muted">Données simulées, aucun appel au serveur</span>
      </div>
      <div className="mt-(--space-4) flex flex-wrap gap-(--space-2)">
        {devTools.scenarios.map((scenario) => (
          <Button
            key={scenario.courseId}
            size="sm"
            variant="secondary"
            title={scenario.description}
            onClick={() => {
              enterFullscreen()
              navigate(paths.presentation(scenario.courseId))
            }}
          >
            {scenario.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            await devTools.expireSession()
            setMessage('Session expirée : la prochaine action vous redirigera vers la connexion.')
          }}
        >
          401 · Expirer la session
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            devTools.resetMockData()
            setMessage('Données de démonstration réinitialisées.')
            onDataChanged()
          }}
        >
          Réinitialiser les données
        </Button>
      </div>
      <p className="mt-(--space-3) typo-body-small text-ink-muted">
        « Réseaux — Le modèle OSI » est en séance : il est verrouillé (modification et suppression refusées).
      </p>
      <p className="mt-(--space-2) typo-body-small text-ink-muted">
        Pour simuler une coupure réseau pendant une présentation, passez le navigateur hors ligne (DevTools › Network ›
        Offline).
      </p>
      {message && (
        <p role="status" className="mt-(--space-2) typo-body-small text-ink">
          {message}
        </p>
      )}
    </section>
  )
}
