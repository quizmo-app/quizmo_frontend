import type { CoursePageContent, PlanItem, PresentationPlan } from '../domain/PresentationPlan'
import type { ElementPlanDto, PageDto, PlanPresentationDto } from './PresentationDto'

export function toPlanItem(dto: ElementPlanDto, position: number): PlanItem {
  switch (dto.type) {
    case 'PAGE':
      return { kind: 'course-page', key: `page-${dto.numero_page}`, pdfPage: dto.numero_page }
    case 'QUIZ':
      return {
        kind: 'quiz',
        key: `quiz-${dto.id_quiz}-${position}`,
        quizId: dto.id_quiz,
        title: dto.titre,
        questionCount: dto.nb_questions,
        afterPage: dto.apres_page,
      }
    case 'LEADERBOARD':
      return {
        kind: 'leaderboard',
        key: `leaderboard-${dto.id_leaderboard}-${position}`,
        leaderboardId: dto.id_leaderboard,
        title: dto.titre,
        afterPage: dto.apres_page,
      }
  }
}

export function toPresentationPlan(dto: PlanPresentationDto): PresentationPlan {
  return {
    presentationId: dto.id_presentation,
    course: { id: dto.cours.id, title: dto.cours.titre },
    version: dto.version.numero,
    pageCount: dto.version.nb_pages,
    items: dto.elements.map(toPlanItem),
    startIndex: dto.position_courante,
    resumed: dto.reprise,
  }
}

export function toCoursePageContent(dto: PageDto): CoursePageContent {
  return { pdfPage: dto.numero_page, mediaType: dto.type_media, src: dto.url }
}
