/** Contrat attendu de GET /cours et POST /cours (hypothèse, à aligner avec le back-end). */
export interface CoursDto {
  id: string
  titre: string
  description: string
  version_courante: number
  nb_pages: number
  nb_quiz: number
  nb_leaderboards: number
  archive: boolean
  pdf_disponible: boolean
  presentation_active: boolean
  /** ISO-8601 */
  date_maj: string
}

// ───────────────────────────── QM-17 : gestion des cours (contrats supposés) ─────────────────────────────

/** Insertion (quiz ou leaderboard) placée « après la page n ». */
export interface InsertionDto {
  id: string
  type: 'QUIZ' | 'LEADERBOARD'
  titre: string
  nb_questions?: number
  after_page: number
  ordre: number
}

/** GET /api/v1/courses/{cours_id}/structure → 200 (hypothèse : endpoint non nommé dans le dossier) */
export interface StructureCoursDto {
  cours_id: string
  titre: string
  version: number
  page_count: number
  /** Présentation en cours : modification et suppression refusées (409 COURS_VERROUILLE). */
  verrouille: boolean
  archive: boolean
  insertions: InsertionDto[]
}

/** PUT /api/v1/courses/{cours_id}/structure → 200 OK */
export interface StructurePositionsDto {
  positions: { id: string; after_page: number; ordre: number }[]
}

/** Corps d'erreur JSON supposé (401, 403, 404, 409, 422). */
export interface ErreurApiDto {
  code: string
  message: string
}
