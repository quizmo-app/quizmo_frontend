import { AppError } from '@/shared/domain/AppError'
import { managementLock, type Course } from './Course'
import type { CourseRepository } from './CourseRepository'
import {
  findMisplacedInsertions,
  toPlacements,
  type CourseStructure,
  type Insertion,
} from './CourseStructure'

/** EF-06 : enregistrer la structure cours + quiz. */
export async function saveStructure(
  repository: CourseRepository,
  structure: CourseStructure,
  insertions: Insertion[],
): Promise<void> {
  assertEditable(structure)
  if (findMisplacedInsertions(insertions, structure.pageCount).length > 0) throw new AppError('INVALID_STRUCTURE')
  await repository.saveStructure(structure.courseId, toPlacements(insertions))
}

/** EF-07 : supprimer le cours (après confirmation explicite de l'enseignant). */
export async function deleteCourse(repository: CourseRepository, course: Pick<Course, 'id' | 'hasActivePresentation'>) {
  if (course.hasActivePresentation) throw new AppError('COURSE_LOCKED')
  await repository.deleteCourse(course.id)
}

function assertEditable(structure: CourseStructure): void {
  const lock = managementLock({ hasActivePresentation: structure.locked, archived: structure.archived })
  if (lock === 'in-session') throw new AppError('COURSE_LOCKED')
  if (lock === 'archived') throw new AppError('COURSE_ARCHIVED')
}
