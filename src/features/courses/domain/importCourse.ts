import { AppError } from '@/shared/domain/AppError'
import type { Course } from './Course'
import type { CourseRepository } from './CourseRepository'
import { validateFile, validateTitle } from './validation'

/** Cas d'usage : importer un nouveau cours (CU1.2). Valide côté client avant d'appeler le port. */
export async function importCourse(repository: CourseRepository, titre: string, fichier: File | null): Promise<Course> {
  const titleError = validateTitle(titre)
  if (titleError) throw new AppError(titleError)

  const fileError = validateFile(fichier)
  if (fileError) throw new AppError(fileError)

  return repository.importCourse(titre.trim(), fichier as File)
}
