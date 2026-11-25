import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'accent'
}

const CLASSE_PAR_VARIANTE: Record<NonNullable<ButtonProps['variante']>, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  accent: 'btn--accent',
}

export function Button({ variante = 'primary', className, ...props }: ButtonProps) {
  const classes = [CLASSE_PAR_VARIANTE[variante], className].filter(Boolean).join(' ')
  return <button className={classes} {...props} />
}
