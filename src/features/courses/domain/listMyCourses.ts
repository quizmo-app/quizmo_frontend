import type { Course } from './Course'
import type { CourseRepository } from './CourseRepository'

/** Cas d'usage : lister les cours de l'enseignant (actifs d'abord, puis les plus récents). */
export async function listMyCourses(repository: CourseRepository): Promise<Course[]> {
  const courses = await repository.listMyCourses()
  return [...courses].sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })
}
