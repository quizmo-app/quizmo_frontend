import { useEffect, useLayoutEffect, useRef } from 'react'
import type { NavigationTarget } from '../../domain/presentationMachine'

/**
 * Raccourcis clavier du présentateur :
 *  →, ↓, Page suiv., Espace : suivant   ·  ←, ↑, Page préc., Retour arrière : précédent
 *  Début / Fin : premier / dernier élément
 *  chiffres puis Entrée : aller à l'élément n (comme dans les logiciels de diaporama)
 *  P : afficher le sommaire  ·  Échap : terminer la présentation
 */
export function usePresenterKeyboard(handlers: {
  enabled: boolean
  onNavigate: (target: NavigationTarget) => void
  onEnd: () => void
  onTogglePlan: () => void
}) {
  const handlersRef = useRef(handlers)
  useLayoutEffect(() => {
    handlersRef.current = handlers
  })
  const digitsRef = useRef('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { enabled, onNavigate, onEnd, onTogglePlan } = handlersRef.current
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (isEditable(event.target)) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onEnd()
        return
      }
      if (!enabled) return

      if (/^\d$/.test(event.key)) {
        digitsRef.current = (digitsRef.current + event.key).slice(-4)
        return
      }
      if (event.key === 'Enter' && digitsRef.current) {
        event.preventDefault()
        onNavigate({ kind: 'index', index: Number(digitsRef.current) - 1 })
        digitsRef.current = ''
        return
      }
      digitsRef.current = ''

      const target = keyToTarget(event.key)
      if (target) {
        event.preventDefault()
        onNavigate(target)
      } else if (event.key === 'p' || event.key === 'P') {
        onTogglePlan()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

function keyToTarget(key: string): NavigationTarget | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      return { kind: 'next' }
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
    case 'Backspace':
      return { kind: 'previous' }
    case 'Home':
      return { kind: 'first' }
    case 'End':
      return { kind: 'last' }
    default:
      return null
  }
}

function isEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}
