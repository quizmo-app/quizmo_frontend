import { useEffect, useState } from 'react'

/** Doit être appelé pendant un geste utilisateur (clic), sinon le navigateur refuse. */
export function enterFullscreen(): void {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) return
  document.documentElement.requestFullscreen().catch(() => {
    // Refus du navigateur (iframe, permissions) : la présentation reste utilisable en fenêtre.
  })
}

export function exitFullscreen(): void {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
}

/** Suit l'état plein écran ; `onExit` est appelé quand l'utilisateur quitte le plein écran (ex. Échap). */
export function useFullscreen(onExit?: () => void): boolean {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement))
  useEffect(() => {
    const onChange = () => {
      const active = Boolean(document.fullscreenElement)
      setIsFullscreen(active)
      if (!active) onExit?.()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [onExit])
  return isFullscreen
}
