import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { FlashState } from './paths'

/** Affiche une seule fois le message flash transmis par la navigation (ex. retour de présentation, import réussi). */
export function useFlash() {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash] = useState(() => (location.state as FlashState | null)?.flash)
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])
  return flash
}
