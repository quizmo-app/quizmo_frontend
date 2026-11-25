import { AppError } from '@/shared/domain/AppError'
import type { CoursePageContent, CoursePageItem, PresentationPlan } from './PresentationPlan'
import type { PresentationRepository } from './PresentationRepository'
import { clampIndex } from './planQueries'

/**
 * Cas d'usage CU2.1 — fonctions pures orchestrant le port `PresentationRepository`.
 * Elles ne connaissent ni React, ni HTTP.
 */

/** Démarrer (ou reprendre) la présentation d'un cours. */
export async function startPresentation(
  repository: PresentationRepository,
  courseId: string,
): Promise<PresentationPlan> {
  if (!courseId.trim()) throw new AppError('NOT_FOUND')
  const plan = await repository.open(courseId)
  // Un plan sans aucune page de cours signifie que le PDF n'est pas exploitable.
  if (!plan.items.some((item) => item.kind === 'course-page')) throw new AppError('PDF_UNAVAILABLE')
  return { ...plan, startIndex: clampIndex(plan, plan.startIndex) }
}

/** Lire une page de cours dans la version figée de la présentation. */
export function loadCoursePage(
  repository: PresentationRepository,
  plan: PresentationPlan,
  item: CoursePageItem,
): Promise<CoursePageContent> {
  return repository.getCoursePage({ courseId: plan.course.id, version: plan.version, pdfPage: item.pdfPage })
}

/** Enregistrer la page courante (permet la reprise à la dernière page). */
export function recordPosition(
  repository: PresentationRepository,
  plan: PresentationPlan,
  index: number,
): Promise<void> {
  return repository.savePosition({ presentationId: plan.presentationId, index: clampIndex(plan, index) })
}

/** Clôturer la présentation et libérer la version. */
export function endPresentation(repository: PresentationRepository, plan: PresentationPlan): Promise<void> {
  return repository.close(plan.presentationId)
}
