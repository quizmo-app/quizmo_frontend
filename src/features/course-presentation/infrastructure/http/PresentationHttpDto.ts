/**
 * Contrat réel de la présentation (QM-14, app/presentations/schemas.py) : JSON camelCase,
 * ids numériques, `positionCourante` 1-based. Le DTO historique (`../PresentationDto.ts`)
 * reste celui du serveur mock.
 *
 * Champs du domaine absents de la réponse → valeur par défaut :
 *  - `questionCount` d'un quiz → complété par GET /api/cours/{id}/quiz (`nbQuestions`), sinon 0
 *  - `title` d'un quiz / leaderboard → `titre`, sinon ''
 *  - `afterPage` → `apresPage`, sinon 0
 *  - `pageCount` → nombre d'éléments PAGE du plan
 *  - `resumed` → `positionCourante > 1` (le back-end ne distingue pas création et reprise ;
 *                une reprise restée sur le premier élément est vue comme une ouverture)
 */
import type { PlanItem, PresentationPlan } from '../../domain/PresentationPlan'

export interface PlanElementHttpDto {
  position: number
  type: 'PAGE' | 'QUIZ' | 'LEADERBOARD'
  numeroPage?: number | null
  pageUrl?: string | null
  preloadPageUrl?: string | null
  idQuiz?: number | null
  idLeaderboard?: number | null
  titre?: string | null
  apresPage?: number | null
}

/** GET /api/cours/{id}/presentation (et toutes les actions de navigation) → 200. */
export interface PlanPresentationHttpDto {
  idPresentation: number
  idCours: number
  titre: string
  version: number
  etat: 'EN_PRESENTATION' | 'QUIZ_EN_COURS' | 'INTERROMPUE' | 'TERMINEE'
  positionCourante: number
  nbElements: number
  element: PlanElementHttpDto
  elements: PlanElementHttpDto[]
}

/** GET /api/cours/{id}/quiz → 200 (résumé, utilisé pour le nombre de questions). */
export interface QuizResumeHttpDto {
  idQuiz: number
  nbQuestions: number
}

function toPlanItem(dto: PlanElementHttpDto, questionCounts: Map<number, number>): PlanItem {
  switch (dto.type) {
    case 'PAGE':
      return { kind: 'course-page', key: `page-${dto.numeroPage}`, pdfPage: dto.numeroPage ?? dto.position }
    case 'QUIZ':
      return {
        kind: 'quiz',
        key: `quiz-${dto.idQuiz}-${dto.position}`,
        quizId: String(dto.idQuiz),
        title: dto.titre ?? '',
        questionCount: (dto.idQuiz != null ? questionCounts.get(dto.idQuiz) : undefined) ?? 0,
        afterPage: dto.apresPage ?? 0,
      }
    case 'LEADERBOARD':
      return {
        kind: 'leaderboard',
        key: `leaderboard-${dto.idLeaderboard}-${dto.position}`,
        leaderboardId: String(dto.idLeaderboard),
        title: dto.titre ?? '',
        afterPage: dto.apresPage ?? 0,
      }
  }
}

export function toPresentationPlan(dto: PlanPresentationHttpDto, quizzes: QuizResumeHttpDto[]): PresentationPlan {
  const questionCounts = new Map(quizzes.map((q) => [q.idQuiz, q.nbQuestions]))
  return {
    presentationId: String(dto.idPresentation),
    course: { id: String(dto.idCours), title: dto.titre },
    version: dto.version,
    pageCount: dto.elements.filter((e) => e.type === 'PAGE').length,
    items: dto.elements.map((e) => toPlanItem(e, questionCounts)),
    startIndex: Math.max(0, dto.positionCourante - 1),
    resumed: dto.positionCourante > 1,
  }
}
