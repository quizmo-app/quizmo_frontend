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
 * États d'un cours (diagramme d'états-transitions, QM-17) :
 *  - initialized : version v1 vierge, aucun quiz ni classement ;
 *  - interactive : au moins un quiz ou classement inséré, prêt pour une séance ;
 *  - in-session  : présentation en cours, cours verrouillé.
 * (« Mise à jour de version » est un état transitoire porté par l'éditeur ;
 *  « Supprimé et purgé » n'est plus visible.)
 */
export type CourseLifecycle = 'initialized' | 'interactive' | 'in-session'

export function lifecycleOf(course: Pick<Course, 'quizCount' | 'leaderboardCount' | 'hasActivePresentation'>): CourseLifecycle {
  if (course.hasActivePresentation) return 'in-session'
  return course.quizCount + course.leaderboardCount > 0 ? 'interactive' : 'initialized'
}

/**
 * Peut-on modifier le cours (positions des quiz) ?
 * Verrouillé pendant une séance ; un cours archivé reste en lecture seule (hypothèse, cf. README).
 */
export function managementLock(course: Pick<Course, 'hasActivePresentation' | 'archived'>): 'in-session' | 'archived' | null {
  if (course.hasActivePresentation) return 'in-session'
  if (course.archived) return 'archived'
  return null
}

/** La suppression est refusée seulement pendant une séance (diagramme d'états). */
export function canDelete(course: Pick<Course, 'hasActivePresentation'>): boolean {
  return !course.hasActivePresentation
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
