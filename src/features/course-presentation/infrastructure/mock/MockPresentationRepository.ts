import type { MockServer } from '@/mocks/server/MockServer'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import type { CoursePageContent, PresentationPlan } from '../../domain/PresentationPlan'
import type { PresentationRepository } from '../../domain/PresentationRepository'
import { toCoursePageContent, toPresentationPlan } from '../presentationMapper'

/**
 * Implémentation mock du port CU2.1.
 * Le futur `HttpPresentationRepository` aura la même forme : appel HTTP → DTO → mapper → domaine.
 */
export class MockPresentationRepository implements PresentationRepository {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  open(courseId: string): Promise<PresentationPlan> {
    return withAppErrors(async () => toPresentationPlan(await this.server.openPresentation(courseId)))
  }

  getCoursePage(params: { courseId: string; version: number; pdfPage: number }): Promise<CoursePageContent> {
    return withAppErrors(async () =>
      toCoursePageContent(await this.server.getPage(params.courseId, params.version, params.pdfPage)),
    )
  }

  savePosition(params: { presentationId: string; index: number }): Promise<void> {
    return withAppErrors(() => this.server.savePosition(params.presentationId, params.index))
  }

  close(presentationId: string): Promise<void> {
    return withAppErrors(() => this.server.closePresentation(presentationId))
  }
}
