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

/** Codes métier (wire, en français côté contrat API) explicites, indépendants du statut HTTP qui les porte. */
const APP_ERROR_CODE_PAR_CODE_FIL: Record<string, AppError['code']> = {
  COURS_ARCHIVE: 'COURSE_ARCHIVED',
  PDF_INDISPONIBLE: 'PDF_UNAVAILABLE',
  TITRE_MANQUANT: 'MISSING_TITLE',
  CHAMP_OBLIGATOIRE: 'FIELD_REQUIRED',
  QUIZ_SANS_QUESTION: 'QUIZ_NO_QUESTION',
  DUREE_INVALIDE: 'DURATION_INVALID',
  QCM_NB_OPTIONS_INVALIDE: 'MCQ_OPTION_COUNT_INVALID',
  QCM_AUCUNE_BONNE_REPONSE: 'MCQ_NO_CORRECT_ANSWER',
  QCM_CHOIX_MULTIPLE_REQUIS: 'MCQ_MULTIPLE_WITHOUT_FLAG',
  LIBRE_REPONSE_REQUISE: 'OPEN_ANSWER_REQUIRED',
  POSITION_INVALIDE: 'POSITION_INVALID',
  // QM-13 (CU1.4) reprend les mêmes situations sous d'autres noms de code (réserve non harmonisée).
  PAGE_INVALIDE: 'POSITION_INVALID',
  QUIZ_INVALIDE: 'QUIZ_INVALID',
  VERSION_NON_COURANTE: 'VERSION_NOT_CURRENT',
  QUIZ_DEJA_INSERE: 'QUIZ_ALREADY_INSERTED',
  RESSOURCE_INTROUVABLE: 'NOT_FOUND',
  COURS_VERROUILLE: 'COURSE_LOCKED',
}

/**
 * Codes fil dont le sens dépend du statut qui les porte, vérifiés avant la table ci-dessus.
 * QM-17 renvoie POSITION_INVALIDE en 422 pour une structure de cours invalide (PUT …/structure),
 * là où QM-12 l'emploie en 400 pour une position d'insertion de quiz.
 */
const APP_ERROR_CODE_PAR_STATUT_ET_CODE: Record<string, AppError['code']> = {
  '422:POSITION_INVALIDE': 'INVALID_STRUCTURE',
}

/** Traduction transport → domaine. Un code fil explicite l'emporte toujours sur le repli par statut. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error instanceof ApiError) {
    if (error.status === NETWORK_STATUS) return new AppError('NETWORK')
    const parStatut = error.code ? APP_ERROR_CODE_PAR_STATUT_ET_CODE[`${error.status}:${error.code}`] : undefined
    if (parStatut) return new AppError(parStatut)
    if (error.code && error.code in APP_ERROR_CODE_PAR_CODE_FIL) {
      return new AppError(APP_ERROR_CODE_PAR_CODE_FIL[error.code])
    }
    if (error.status === 400) return new AppError('MISSING_TITLE')
    if (error.status === 401) return new AppError('UNAUTHENTICATED')
    if (error.status === 403) return new AppError('FORBIDDEN')
    if (error.status === 404) return new AppError('NOT_FOUND')
    if (error.status === 413) return new AppError('FILE_TOO_LARGE')
    if (error.status === 415) return new AppError('INVALID_FORMAT')
    if (error.status === 422) return new AppError('UNREADABLE_PDF')
    if (error.status === 503) return new AppError('SERVER_UNAVAILABLE')
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
