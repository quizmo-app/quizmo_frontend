/** Entité « Cours » telle que vue depuis le tableau de bord de l'enseignant. */
export interface Course {
  id: string
  title: string
  description: string
  /** Numéro de la version courante (est_courante). */
  currentVersion: number
  pageCount: number
  quizCount: number
  leaderboardCount: number
  archived: boolean
  pdfAvailable: boolean
  /** Une présentation est déjà active : « Présenter » reprendra à la dernière page enregistrée. */
  hasActivePresentation: boolean
  updatedAt: Date
}

/**
 * Pré-contrôle côté client, purement indicatif (UX).
 * Les contrôles faisant foi restent ceux du back-end (session, propriétaire, archivage, PDF).
 */
export function presentability(course: Course): { canPresent: true } | { canPresent: false; reason: string } {
  if (course.archived) return { canPresent: false, reason: 'Cours archivé' }
  if (!course.pdfAvailable) return { canPresent: false, reason: 'PDF indisponible' }
  return { canPresent: true }
}
