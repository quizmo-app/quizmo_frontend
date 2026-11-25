import type {
  CourseStructure,
  Insertion,
  InsertionPlacement,
} from '../domain/CourseStructure'
import type {
  InsertionDto,
  StructureCoursDto,
  StructurePositionsDto,
} from './CourseDto'

export function toInsertion(dto: InsertionDto): Insertion {
  return {
    id: dto.id,
    kind: dto.type === 'QUIZ' ? 'quiz' : 'leaderboard',
    title: dto.titre,
    questionCount: dto.nb_questions,
    afterPage: dto.after_page,
    order: dto.ordre,
  }
}

export function toCourseStructure(dto: StructureCoursDto): CourseStructure {
  return {
    courseId: dto.cours_id,
    title: dto.titre,
    version: dto.version,
    pageCount: dto.page_count,
    locked: dto.verrouille,
    archived: dto.archive,
    insertions: dto.insertions.map(toInsertion),
  }
}

export function toPositionsDto(placements: InsertionPlacement[]): StructurePositionsDto {
  return { positions: placements.map((p) => ({ id: p.id, after_page: p.afterPage, ordre: p.order })) }
}
