import type { Course } from './Course'
import type { CourseStructure, InsertionPlacement } from './CourseStructure'

/** Port (interface) : implémenté par l'infrastructure (mock aujourd'hui, HTTP demain). */
export interface CourseRepository {
  /** EF-01 — GET /api/v1/courses : cours dont l'enseignant authentifié est propriétaire. */
  listMyCourses(): Promise<Course[]>

  /** EF-03 — structure du cours (version active, pages, emplacements des quiz) pour l'éditeur. */
  getStructure(courseId: string): Promise<CourseStructure>

  /** EF-06 — PUT /api/v1/courses/{id}/structure : enregistre les positions des quiz. */
  saveStructure(courseId: string, placements: InsertionPlacement[]): Promise<void>

  /** EF-07 — DELETE /api/v1/courses/{id} : supprime cours, PDF et résultats associés (RGPD). */
  deleteCourse(courseId: string): Promise<void>
}

/**
 * Port : rendu des miniatures de pages (EF-03).
 * Mock : image générée par le faux PdfService ; cible : rendu PDF.js du fichier de la version active.
 */
export interface PageThumbnailRenderer {
  render(courseId: string, version: number, page: number): Promise<string>
}
