const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export type ApiErrorCode =
  | 'TITRE_MANQUANT'
  | 'FICHIER_TROP_VOLUMINEUX'
  | 'FORMAT_NON_PDF'
  | 'PDF_ILLISIBLE'
  | 'NON_AUTHENTIFIE'
  | 'BDD_INDISPONIBLE'
  | 'ERREUR_INCONNUE'

const CODE_PAR_STATUT: Record<number, ApiErrorCode> = {
  400: 'TITRE_MANQUANT',
  401: 'NON_AUTHENTIFIE',
  413: 'FICHIER_TROP_VOLUMINEUX',
  415: 'FORMAT_NON_PDF',
  422: 'PDF_ILLISIBLE',
  503: 'BDD_INDISPONIBLE',
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

interface ErrorBody {
  code?: string
  message?: string
}

export async function apiPost<T>(path: string, body: FormData): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      body,
      credentials: 'include',
    })
  } catch {
    throw new ApiError(0, 'ERREUR_INCONNUE', 'Impossible de contacter le serveur. Réessayez dans quelques minutes.')
  }

  if (!response.ok) {
    const code = CODE_PAR_STATUT[response.status] ?? 'ERREUR_INCONNUE'
    const errorBody: ErrorBody = await response.json().catch(() => ({}))
    throw new ApiError(response.status, code, errorBody.message ?? MESSAGE_PAR_DEFAUT[code])
  }

  return response.json() as Promise<T>
}

const MESSAGE_PAR_DEFAUT: Record<ApiErrorCode, string> = {
  TITRE_MANQUANT: 'Veuillez saisir le titre du cours.',
  FICHIER_TROP_VOLUMINEUX: 'Le fichier dépasse la taille maximale autorisée (50 Mo). Choisissez un PDF plus léger (compression, découpage).',
  FORMAT_NON_PDF: 'Le fichier doit être au format PDF.',
  PDF_ILLISIBLE: 'Le PDF est illisible ou protégé. Fournissez un PDF non protégé, réexporté depuis la source.',
  NON_AUTHENTIFIE: 'Vous devez être connecté pour effectuer cette action.',
  BDD_INDISPONIBLE: 'Réessayez dans quelques minutes ou prévenez l’administrateur.',
  ERREUR_INCONNUE: 'Une erreur inattendue est survenue. Réessayez.',
}
