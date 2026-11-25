import type { Course } from '../domain/Course'
import type { CoursDto } from './CourseDto'

export function toCourse(dto: CoursDto): Course {
  return {
    id: dto.id,
    title: dto.titre,
    description: dto.description,
    currentVersion: dto.version_courante,
    pageCount: dto.nb_pages,
    quizCount: dto.nb_quiz,
    leaderboardCount: dto.nb_leaderboards,
    archived: dto.archive,
    pdfAvailable: dto.pdf_disponible,
    hasActivePresentation: dto.presentation_active,
    updatedAt: new Date(dto.date_maj),
  }
}
