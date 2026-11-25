import type { MockServer } from '@/mocks/server/MockServer'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import type { Course } from '../../domain/Course'
import type { CourseRepository } from '../../domain/CourseRepository'
import { toCourse } from '../courseMapper'

/** Implémentation mock : interroge le faux back-end en mémoire, puis mappe DTO → domaine. */
export class MockCourseRepository implements CourseRepository {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  listMyCourses(): Promise<Course[]> {
    return withAppErrors(async () => (await this.server.listMyCourses()).map(toCourse))
  }

  getCourse(courseId: string): Promise<Course> {
    return withAppErrors(async () => toCourse(await this.server.getCourse(courseId)))
  }

  importCourse(titre: string, fichier: File): Promise<Course> {
    return withAppErrors(async () => toCourse(await this.server.importCourse({ titre, fichier })))
  }
}
