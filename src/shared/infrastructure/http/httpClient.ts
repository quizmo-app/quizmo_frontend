import { ApiError, NETWORK_STATUS } from './ApiError'

/**
 * Client HTTP partagé par les adaptateurs `Http*` (VITE_API_MODE=http).
 *
 * - Base `/api` : en développement, le proxy Vite (`vite.config.ts`) relaie `/api/*` vers
 *   le back-end FastAPI (http://localhost:8000), sans réécriture du chemin.
 * - `credentials: 'include'` : le cookie de session httpOnly (`access_token` / `session`)
 *   part avec chaque requête dès que la connexion (CU1.1) le dépose.
 * - Toute réponse non 2xx devient une `ApiError(statut, code)` ; `withAppErrors` la traduit
 *   ensuite en `AppError` exactement comme pour le serveur mock.
 */
export const API_BASE_URL = '/api'

/** Corps d'erreur du back-end : `{ erreur, message, action?, details? }` (app/exceptions.py). */
interface ErreurHttpDto {
  erreur?: string
  message?: string
  action?: string
  /** Présent pour `erreur: "VALIDATION"` (400) : un détail par champ en faute. */
  details?: { champ: string; code: string; message: string }[]
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: Method
  /** Corps sérialisé en JSON (en-tête `Content-Type: application/json`). */
  json?: unknown
  /** Corps brut (ex. `FormData` : le navigateur pose lui-même le `Content-Type` multipart). */
  body?: BodyInit
}

async function send(path: string, { method = 'GET', json, body }: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (json !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: json !== undefined ? JSON.stringify(json) : body,
    })
  } catch {
    // fetch() ne rejette qu'en cas d'échec réseau (serveur injoignable, hors ligne).
    throw new ApiError(NETWORK_STATUS, 'RESEAU', 'Serveur injoignable')
  }

  if (!response.ok) throw await toApiError(response)
  return response
}

/**
 * Le code fil retenu est `erreur`, sauf pour une erreur de validation (400 `VALIDATION`) :
 * on prend alors le code du premier détail (`CHAMP_OBLIGATOIRE`, `QCM_NOMBRE_OPTIONS`…),
 * le même code que le serveur mock renvoie directement.
 */
async function toApiError(response: Response): Promise<ApiError> {
  let dto: ErreurHttpDto | null = null
  try {
    dto = (await response.json()) as ErreurHttpDto
  } catch {
    // Corps absent ou non JSON (ex. proxy Vite sans back-end) : repli sur le statut seul.
  }
  const code = dto?.erreur === 'VALIDATION' && dto.details?.length ? dto.details[0].code : dto?.erreur
  return new ApiError(response.status, code, dto?.message)
}

export async function requestJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await send(path, options)
  return (await response.json()) as T
}

export async function requestVoid(path: string, options?: RequestOptions): Promise<void> {
  await send(path, options)
}

export async function requestBlob(path: string, options?: RequestOptions): Promise<Blob> {
  const response = await send(path, options)
  return response.blob()
}
