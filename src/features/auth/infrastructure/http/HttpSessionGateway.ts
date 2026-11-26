import { AppError } from '@/shared/domain/AppError'
import { ApiError, withAppErrors } from '@/shared/infrastructure/http/ApiError'
import { requestJson } from '@/shared/infrastructure/http/httpClient'
import type { SessionGateway, Teacher } from '../../domain/SessionGateway'

/** GET /api/auth/me → 200 (app/auth/router.py). */
interface CurrentTeacherHttpDto {
  idEnseignant: string
}

/**
 * Adaptateur HTTP de la session (CU1.1 hors périmètre côté back-end : pas de route de connexion).
 *
 * Mode démonstration : le back-end lancé avec `QUIZMO_UTILISATEUR_DEV=enseignantA` traite toute
 * requête sans en-tête `Authorization` ni cookie comme cet enseignant ; `currentTeacher()` renvoie
 * donc toujours `enseignantA`, et `signIn()` se contente de relire cette identité.
 *
 * Branchement de la vraie connexion (CU1.1, LDAP) : quand le back-end exposera une route
 * `POST /api/auth/login` qui dépose le JWT en cookie httpOnly (`access_token`), `signIn()`
 * l'appellera avec les identifiants saisis sur `LoginPage`, puis relira `/api/auth/me`.
 * `credentials: 'include'` (httpClient) suffit ensuite pour que chaque appel soit authentifié ;
 * aucun jeton n'est stocké côté front. La déconnexion existe déjà : `POST /api/auth/logout`.
 * `displayName` vaut l'identifiant LDAP tant que `/api/auth/me` ne renvoie pas de nom.
 */
export class HttpSessionGateway implements SessionGateway {
  currentTeacher(): Promise<Teacher | null> {
    return withAppErrors(async () => {
      try {
        return toTeacher(await requestJson<CurrentTeacherHttpDto>('/auth/me'))
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    })
  }

  signIn(): Promise<Teacher> {
    return withAppErrors(async () => {
      const teacher = await this.currentTeacher()
      if (!teacher) throw new AppError('UNAUTHENTICATED')
      return teacher
    })
  }
}

function toTeacher(dto: CurrentTeacherHttpDto): Teacher {
  return { id: dto.idEnseignant, displayName: dto.idEnseignant }
}
