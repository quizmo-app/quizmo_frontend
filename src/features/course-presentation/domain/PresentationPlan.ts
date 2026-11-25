/**
 * Plan de présentation : séquence ordonnée (calculée par le back-end, CoursService)
 * des pages PDF de la version figée et des insertions (quiz, leaderboards)
 * placées « après la page p ».
 */
export type PlanItem = CoursePageItem | QuizItem | LeaderboardItem

export interface CoursePageItem {
  kind: 'course-page'
  /** Identifiant stable dans le plan (clé React, navigation). */
  key: string
  /** Numéro de page dans le PDF de la version figée (1-based). */
  pdfPage: number
}

export interface QuizItem {
  kind: 'quiz'
  key: string
  quizId: string
  title: string
  questionCount: number
  /** Page PDF après laquelle le quiz est inséré (0 = avant la première page). */
  afterPage: number
}

export interface LeaderboardItem {
  kind: 'leaderboard'
  key: string
  leaderboardId: string
  title: string
  afterPage: number
}

export interface PresentationPlan {
  presentationId: string
  course: { id: string; title: string }
  /** Version du cours figée pour toute la durée de la présentation. */
  version: number
  pageCount: number
  items: PlanItem[]
  /** Index (0-based) d'ouverture : 0 pour une nouvelle présentation, dernière position enregistrée en cas de reprise. */
  startIndex: number
  /** Vrai si la présentation était déjà active (reprise). */
  resumed: boolean
}

/** Contenu d'une page de cours rendue (image de la page PDF). */
export interface CoursePageContent {
  pdfPage: number
  mediaType: string
  /** URL affichable (URL signée, blob: ou data:). */
  src: string
}
