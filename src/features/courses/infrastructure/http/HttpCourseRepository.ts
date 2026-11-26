import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import { requestJson, requestVoid } from '@/shared/infrastructure/http/httpClient'
import type { Course } from '../../domain/Course'
import type { CourseRepository } from '../../domain/CourseRepository'
import type { CourseStructure, InsertionPlacement } from '../../domain/CourseStructure'
import {
  courseFromDetail,
  courseFromImport,
  courseFromSummary,
  toCourseStructure,
  toPositionsHttpDto,
  type CoursDetailHttpDto,
  type CoursImporteHttpDto,
  type CoursResumeHttpDto,
  type QuizResumeHttpDto,
} from './CourseHttpDto'

/** Adaptateur HTTP du port `CourseRepository` (QM-11, QM-17) contre le back-end FastAPI. */
export class HttpCourseRepository implements CourseRepository {
  listMyCourses(): Promise<Course[]> {
    return withAppErrors(async () => {
      const readAt = new Date()
      const dtos = await requestJson<CoursResumeHttpDto[]>('/cours')
      return dtos.map((dto) => courseFromSummary(dto, readAt))
    })
  }

  getCourse(courseId: string): Promise<Course> {
    return withAppErrors(async () => courseFromDetail(await requestJson<CoursDetailHttpDto>(`/cours/${courseId}`)))
  }

  importCourse(titre: string, fichier: File): Promise<Course> {
    return withAppErrors(async () => {
      const form = new FormData()
      form.append('titre', titre)
      form.append('fichier', fichier)
      const dto = await requestJson<CoursImporteHttpDto>('/cours', { method: 'POST', body: form })
      return courseFromImport(dto, titre)
    })
  }

  getStructure(courseId: string): Promise<CourseStructure> {
    return withAppErrors(async () => {
      const [detail, quizzes] = await Promise.all([
        requestJson<CoursDetailHttpDto>(`/cours/${courseId}`),
        // Seulement pour afficher le nombre de questions : un échec ne bloque pas l'éditeur.
        requestJson<QuizResumeHttpDto[]>(`/cours/${courseId}/quiz`).catch(() => []),
      ])
      return toCourseStructure(detail, quizzes)
    })
  }

  saveStructure(courseId: string, placements: InsertionPlacement[]): Promise<void> {
    return withAppErrors(() =>
      requestVoid(`/cours/${courseId}/structure`, { method: 'PUT', json: toPositionsHttpDto(placements) }),
    )
  }

  deleteCourse(courseId: string): Promise<void> {
    return withAppErrors(() => requestVoid(`/cours/${courseId}`, { method: 'DELETE' }))
  }
}
