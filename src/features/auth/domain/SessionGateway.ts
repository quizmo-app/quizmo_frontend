/** Enseignant connecté vu par le front (le JWT reste dans un cookie httpOnly). */
export interface Teacher {
  id: string
  displayName: string
}

/**
 * Port d'authentification minimal (CU1.1 hors périmètre).
 * Utilisé ici uniquement pour la page de reconnexion après un 401.
 */
export interface SessionGateway {
  currentTeacher(): Promise<Teacher | null>
  /** Placeholder CU1.1 : connexion avec le compte de démonstration. */
  signIn(): Promise<Teacher>
}
