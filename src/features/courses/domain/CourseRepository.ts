import type { Course } from './Course'

/** Port (interface) : implémenté par l'infrastructure (mock aujourd'hui, HTTP demain). */
export interface CourseRepository {
  /** Cours dont l'enseignant authentifié est propriétaire. */
  listMyCourses(): Promise<Course[]>
}
