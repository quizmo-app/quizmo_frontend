import { AppError } from '@/shared/domain/AppError'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import { requestBlob, requestJson, requestVoid } from '@/shared/infrastructure/http/httpClient'
import type { CoursePageContent, PresentationPlan } from '../../domain/PresentationPlan'
import type { PresentationRepository } from '../../domain/PresentationRepository'
import { toPresentationPlan, type PlanPresentationHttpDto, type QuizResumeHttpDto } from './PresentationHttpDto'

/**
 * Adaptateur HTTP du port CU2.1 contre les routes QM-14 (app/presentations/router.py) :
 *  - open          → GET  /api/cours/{id}/presentation (crée ou reprend)
 *  - getCoursePage → GET  /api/cours/{id}/versions/{n}/pages/{p} (PDF d'une page → URL `blob:`)
 *  - savePosition  → PUT  /api/cours/{id}/presentation/position `{ position }` (1-based)
 *  - close         → POST /api/cours/{id}/presentation/terminer
 *
 * Le back-end identifie la présentation par le cours, le port par `presentationId` :
 * l'adaptateur retient le cours de chaque présentation ouverte.
 */
export class HttpPresentationRepository implements PresentationRepository {
  private readonly courseByPresentation = new Map<string, string>()

  open(courseId: string): Promise<PresentationPlan> {
    return withAppErrors(async () => {
      const dto = await requestJson<PlanPresentationHttpDto>(`/cours/${courseId}/presentation`)
      // Seulement pour le nombre de questions affiché sur la diapositive de quiz.
      const quizzes = await requestJson<QuizResumeHttpDto[]>(`/cours/${courseId}/quiz`).catch(() => [])
      const plan = toPresentationPlan(dto, quizzes)
      this.courseByPresentation.set(plan.presentationId, plan.course.id)
      return plan
    })
  }

  getCoursePage({ courseId, version, pdfPage }: { courseId: string; version: number; pdfPage: number }): Promise<CoursePageContent> {
    return withAppErrors(async () => {
      const blob = await requestBlob(`/cours/${courseId}/versions/${version}/pages/${pdfPage}`)
      return { pdfPage, mediaType: blob.type || 'application/pdf', src: URL.createObjectURL(blob) }
    })
  }

  savePosition({ presentationId, index }: { presentationId: string; index: number }): Promise<void> {
    return withAppErrors(() =>
      requestVoid(`/cours/${this.courseOf(presentationId)}/presentation/position`, {
        method: 'PUT',
        json: { position: index + 1 },
      }),
    )
  }

  close(presentationId: string): Promise<void> {
    return withAppErrors(async () => {
      await requestVoid(`/cours/${this.courseOf(presentationId)}/presentation/terminer`, { method: 'POST' })
      this.courseByPresentation.delete(presentationId)
    })
  }

  private courseOf(presentationId: string): string {
    const courseId = this.courseByPresentation.get(presentationId)
    if (!courseId) throw new AppError('NOT_FOUND')
    return courseId
  }
}
