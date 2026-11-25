import type { Course } from './Course'

/** Port (interface) : implémenté par l'infrastructure (mock aujourd'hui, HTTP demain). */
export interface CourseRepository {
  /** Cours dont l'enseignant authentifié est propriétaire. */
  listMyCourses(): Promise<Course[]>
  /** Un cours par son identifiant (404/403 si introuvable ou propriété d'un autre enseignant). */
  getCourse(courseId: string): Promise<Course>
  /** CU1.2 : importe un nouveau support de cours PDF, créé en version 1. */
  importCourse(titre: string, fichier: File): Promise<Course>
}
