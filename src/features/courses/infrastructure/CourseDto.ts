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
