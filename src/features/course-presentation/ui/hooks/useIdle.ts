import { useEffect, useState } from 'react'

/** Vrai après `delayMs` sans mouvement de souris : sert à masquer les contrôles pendant la projection. */
export function useIdle(delayMs = 2500): boolean {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), delayMs)
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), delayMs)
    }
    window.addEventListener('mousemove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [delayMs])
  return idle
}
