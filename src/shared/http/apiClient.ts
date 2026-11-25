import { ApiError } from '../errors/ApiError'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function executer(chemin: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${chemin}`, { credentials: 'include', ...options })
  } catch {
    throw new ApiError(0, null, 'Impossible de contacter le serveur. Réessayez dans quelques minutes.')
  }
}

async function verifier(reponse: Response): Promise<Response> {
  if (!reponse.ok) {
    const corpsErreur = await reponse.json().catch(() => ({}))
    const message = (corpsErreur as { message?: string }).message ?? 'Une erreur est survenue.'
    throw new ApiError(reponse.status, corpsErreur, message)
  }
  return reponse
}

export async function apiPost<T>(chemin: string, corps: FormData): Promise<T> {
  const reponse = await verifier(await executer(chemin, { method: 'POST', body: corps }))
  return reponse.json() as Promise<T>
}

export async function apiPostJson<T>(chemin: string, corps: unknown): Promise<T> {
  const reponse = await verifier(
    await executer(chemin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    }),
  )
  return reponse.json() as Promise<T>
}
