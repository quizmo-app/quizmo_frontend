import type { ButtonHTMLAttributes } from 'react'

/**
 * Bouton Quizmo (charte) : forme pilule, texte en gras (style `button`),
 * anneau de focus `focus-ring`, désactivé à 48 % d'opacité, retours visuels instantanés.
 *  - primary : action principale du tableau de bord (`brand`)
 *  - accent  : énergie de la séance en direct (Lancer le quiz) — jamais sur le tableau de bord
 *  - danger  : action destructrice confirmée (Supprimer définitivement)
 */
type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:brightness-110',
  accent: 'bg-accent text-accent-ink hover:brightness-105',
  secondary: 'bg-surface-200 text-ink border border-border hover:bg-surface-300',
  ghost: 'text-ink-muted hover:bg-surface-300 hover:text-ink',
  danger: 'bg-danger text-danger-ink hover:brightness-110',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-(--space-4) gap-(--space-2)',
  md: 'h-11 px-(--space-5) gap-(--space-2)',
  lg: 'h-14 px-(--space-6) gap-(--space-3)',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`typo-button inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-48 disabled:hover:brightness-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
