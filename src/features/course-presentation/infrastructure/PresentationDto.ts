/**
 * Contrats attendus de l'API (hypothèses alignées sur le modèle de données du dossier :
 * cours, version_cours.est_courante, insertion « après la page p »).
 */

/** GET /cours/{id}/presentation → 200 */
export interface PlanPresentationDto {
  id_presentation: string
  cours: { id: string; titre: string }
  version: { numero: number; nb_pages: number }
  /** Éléments déjà ordonnés par CoursService. */
  elements: ElementPlanDto[]
  /** Dernière position enregistrée (index 0-based dans `elements`). */
  position_courante: number
  /** Vrai si la présentation était déjà active. */
  reprise: boolean
}

export type ElementPlanDto =
  | { type: 'PAGE'; numero_page: number }
  | { type: 'QUIZ'; id_quiz: string; titre: string; nb_questions: number; apres_page: number }
  | { type: 'LEADERBOARD'; id_leaderboard: string; titre: string; apres_page: number }

/** GET /cours/{id}/versions/{n}/pages/{p} → 200 */
export interface PageDto {
  numero_page: number
  type_media: string
  url: string
}

/** PUT /presentations/{id}/position (hypothèse) */
export interface PositionDto {
  position: number
}
