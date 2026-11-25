import type { ElementPlanDto } from '@/features/course-presentation/infrastructure/PresentationDto'
import type { MockInsertion } from './fixtures'

/**
 * Réplique mock du traitement CoursService « Ordonner pages PDF et insertions (après la page p) ».
 * Règles supposées (à confirmer côté back-end) :
 *  - une insertion « après la page p » suit immédiatement la page p ;
 *  - p = 0 place l'insertion avant la première page ;
 *  - plusieurs insertions sur la même page sont triées par `ordre` ;
 *  - p > nombre de pages place l'insertion en fin de plan.
 */
export function orderPlanElements(pageCount: number, insertions: MockInsertion[]): ElementPlanDto[] {
  const byPage = new Map<number, MockInsertion[]>()
  for (const insertion of insertions) {
    const anchor = Math.min(Math.max(insertion.apresPage, 0), pageCount)
    byPage.set(anchor, [...(byPage.get(anchor) ?? []), insertion])
  }
  const toDto = (insertion: MockInsertion): ElementPlanDto =>
    insertion.type === 'QUIZ'
      ? {
          type: 'QUIZ',
          id_quiz: insertion.id,
          titre: insertion.titre,
          nb_questions: insertion.nbQuestions ?? 0,
          apres_page: insertion.apresPage,
        }
      : { type: 'LEADERBOARD', id_leaderboard: insertion.id, titre: insertion.titre, apres_page: insertion.apresPage }
  const insertionsAfter = (page: number) =>
    [...(byPage.get(page) ?? [])].sort((a, b) => a.ordre - b.ordre).map(toDto)

  const elements: ElementPlanDto[] = [...insertionsAfter(0)]
  for (let page = 1; page <= pageCount; page++) {
    elements.push({ type: 'PAGE', numero_page: page }, ...insertionsAfter(page))
  }
  return elements
}
