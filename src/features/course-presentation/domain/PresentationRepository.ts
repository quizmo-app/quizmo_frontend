import type { CoursePageContent, PresentationPlan } from './PresentationPlan'

/**
 * Port de la fonctionnalité CU2.1. Endpoints cibles (cf. dossier de conception) :
 *  - open            → GET  /cours/{id}/presentation
 *  - getCoursePage   → GET  /cours/{id}/versions/{n}/pages/{p}
 *  - savePosition    → (endpoint non spécifié, hypothèse : PUT /presentations/{id}/position)
 *  - close           → (endpoint non spécifié, hypothèse : POST /presentations/{id}/cloture)
 *
 * Toutes les méthodes rejettent avec une `AppError`.
 */
export interface PresentationRepository {
  /** Crée la présentation (fige la version courante) ou reprend celle déjà active, et renvoie le plan ordonné. */
  open(courseId: string): Promise<PresentationPlan>
  getCoursePage(params: { courseId: string; version: number; pdfPage: number }): Promise<CoursePageContent>
  /** Enregistre la position courante dans le plan (reprise ultérieure). */
  savePosition(params: { presentationId: string; index: number }): Promise<void>
  /** Clôture la présentation et libère la version figée. */
  close(presentationId: string): Promise<void>
}
