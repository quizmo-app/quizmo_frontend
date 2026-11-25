import { AppError } from '@/shared/domain/AppError'

/**
 * Erreur de transport (statut HTTP + code métier renvoyé par l'API).
 * Partagée par le serveur mock et les futurs clients HTTP : seule l'infrastructure la manipule.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `HTTP ${status}${code ? ` (${code})` : ''}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/** Statut 0 : la requête n'a pas abouti (coupure réseau). */
export const NETWORK_STATUS = 0

/** Traduction transport → domaine. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error instanceof ApiError) {
    if (error.status === NETWORK_STATUS) return new AppError('NETWORK')
    if (error.status === 401) return new AppError('UNAUTHENTICATED')
    if (error.status === 403) return new AppError('FORBIDDEN')
    if (error.status === 404) return new AppError('NOT_FOUND')
    if (error.code === 'COURS_ARCHIVE') return new AppError('COURSE_ARCHIVED')
    if (error.code === 'PDF_INDISPONIBLE') return new AppError('PDF_UNAVAILABLE')
    if (error.code === 'COURS_VERROUILLE') return new AppError('COURSE_LOCKED')
    if (error.code === 'POSITION_INVALIDE') return new AppError('INVALID_STRUCTURE')
    return AppError.from(error)
  }
  // fetch() rejette avec un TypeError en cas d'échec réseau.
  if (error instanceof TypeError) return new AppError('NETWORK')
  return AppError.from(error)
}

/** Exécute un appel d'infrastructure en normalisant toute erreur en `AppError`. */
export async function withAppErrors<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call()
  } catch (error) {
    throw toAppError(error)
  }
}
