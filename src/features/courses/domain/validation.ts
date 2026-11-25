import type { AppErrorCode } from '@/shared/domain/AppError'

const MAX_FILE_SIZE = 50 * 1024 * 1024

/** Règles de contrôle du CU1.2, rejouées côté client avant l'appel réseau (la source de vérité reste le serveur). */
export function validateTitle(titre: string): AppErrorCode | null {
  return titre.trim().length === 0 ? 'MISSING_TITLE' : null
}

export function validateFile(fichier: File | null): AppErrorCode | null {
  if (!fichier) return 'INVALID_FORMAT'
  const estPdf = fichier.type === 'application/pdf' || fichier.name.toLowerCase().endsWith('.pdf')
  if (!estPdf) return 'INVALID_FORMAT'
  if (fichier.size > MAX_FILE_SIZE) return 'FILE_TOO_LARGE'
  return null
}
