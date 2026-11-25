import type { MockServer } from '@/mocks/server/MockServer'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import type { Course } from '../../domain/Course'
import type { CourseRepository, PageThumbnailRenderer } from '../../domain/CourseRepository'
import type {
  CourseStructure,
  InsertionPlacement,
} from '../../domain/CourseStructure'
import { toCourse } from '../courseMapper'
import {
  toCourseStructure,
  toPositionsDto,
} from '../structureMapper'

/**
 * Implémentation mock : interroge le faux back-end en mémoire, puis mappe DTO → domaine.
 * Le futur `HttpCourseRepository` aura la même forme : mêmes corps JSON, mêmes mappers,
 * seul l'appel `this.server.x()` devient un `fetch('/api/v1/courses…')`.
 */
export class MockCourseRepository implements CourseRepository {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  listMyCourses(): Promise<Course[]> {
    return withAppErrors(async () => (await this.server.listMyCourses()).map(toCourse))
  }

  getStructure(courseId: string): Promise<CourseStructure> {
    return withAppErrors(async () => toCourseStructure(await this.server.getStructure(courseId)))
  }

  saveStructure(courseId: string, placements: InsertionPlacement[]): Promise<void> {
    return withAppErrors(() => this.server.saveStructure(courseId, toPositionsDto(placements)))
  }

  deleteCourse(courseId: string): Promise<void> {
    return withAppErrors(() => this.server.deleteCourse(courseId))
  }
}

/** Miniatures mock : réutilise le rendu de page du faux PdfService (GET …/versions/{n}/pages/{p}). */
export class MockPageThumbnailRenderer implements PageThumbnailRenderer {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  render(courseId: string, version: number, page: number): Promise<string> {
    return withAppErrors(async () => (await this.server.getPage(courseId, version, page)).url)
  }
}
