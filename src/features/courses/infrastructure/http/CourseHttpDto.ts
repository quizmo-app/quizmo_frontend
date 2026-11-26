/**
 * Contrat réel du back-end FastAPI pour les cours (app/routers/cours.py, app/schemas.py) :
 * chemins `/api/cours`, JSON camelCase, identifiants numériques.
 * Les DTO historiques (`../CourseDto.ts`, snake_case, ids en chaîne) restent ceux du serveur mock.
 *
 * Champs du domaine que le back-end ne renvoie pas → valeur par défaut :
 *  - `description`            → '' (aucune description stockée côté back-end)
 *  - `leaderboardCount`       → 0 dans la liste (GET /api/cours ne renvoie que `nbQuiz`) ;
 *                               compté depuis `insertions` pour un cours ouvert (GET /api/cours/{id})
 *  - `quizCount` (cours ouvert) → compté depuis `insertions` (type QUIZ)
 *  - `archived` / `archive`   → false (pas d'archivage exposé ; un cours archivé est refusé par
 *                               le back-end au lancement de la présentation, 409 COURS_ARCHIVE)
 *  - `pdfAvailable`           → true (sinon 409 PDF_INDISPONIBLE au lancement de la présentation)
 *  - `hasActivePresentation` / `locked` → false (non exposé ; une modification pendant une séance
 *                               est refusée par le back-end, 409 COURS_VERROUILLE)
 *  - `updatedAt`              → date de la lecture (pas de `dateMaj` côté back-end)
 *  - `questionCount` (insertion) → complété par GET /api/cours/{id}/quiz quand disponible
 *  - `order` à l'enregistrement → non envoyé : PUT …/structure ne prend que `apresPage`
 */
import type { Course } from '../../domain/Course'
import type { CourseStructure, Insertion, InsertionPlacement } from '../../domain/CourseStructure'

/** GET /api/cours → 200 : une ligne du tableau de bord. */
export interface CoursResumeHttpDto {
  idCours: number
  titre: string
  version: number
  nbPages: number
  nbQuiz: number
}

/** Un quiz ou leaderboard placé après une page de la version courante. */
export interface InsertionCoursHttpDto {
  idInsertion: number
  type: 'QUIZ' | 'LEADERBOARD'
  idQuiz?: number | null
  idLeaderboard?: number | null
  titre: string
  apresPage: number
  ordre: number
}

/** GET /api/cours/{id} et PUT /api/cours/{id}/structure → 200. */
export interface CoursDetailHttpDto {
  idCours: number
  titre: string
  version: number
  idVersion: number
  nbPages: number
  insertions: InsertionCoursHttpDto[]
}

/** POST /api/cours (multipart `titre`, `fichier`) → 201. */
export interface CoursImporteHttpDto {
  idCours: number
  idVersion: number
  nbPages: number
}

/** Un élément du corps de PUT /api/cours/{id}/structure. */
export interface PositionInsertionHttpDto {
  idInsertion: number
  apresPage: number
}

/** GET /api/cours/{id}/quiz → 200 : résumé des quiz du cours (utilisé pour le nombre de questions). */
export interface QuizResumeHttpDto {
  idQuiz: number
  titre: string
  nbQuestions: number
  apresPage: number | null
}

const DEFAULTS = {
  description: '',
  archived: false,
  pdfAvailable: true,
  hasActivePresentation: false,
} as const

export function courseFromSummary(dto: CoursResumeHttpDto, readAt: Date): Course {
  return {
    ...DEFAULTS,
    id: String(dto.idCours),
    title: dto.titre,
    currentVersion: dto.version,
    pageCount: dto.nbPages,
    quizCount: dto.nbQuiz,
    leaderboardCount: 0,
    updatedAt: readAt,
  }
}

export function courseFromDetail(dto: CoursDetailHttpDto): Course {
  return {
    ...DEFAULTS,
    id: String(dto.idCours),
    title: dto.titre,
    currentVersion: dto.version,
    pageCount: dto.nbPages,
    quizCount: dto.insertions.filter((i) => i.type === 'QUIZ').length,
    leaderboardCount: dto.insertions.filter((i) => i.type === 'LEADERBOARD').length,
    updatedAt: new Date(),
  }
}

/** L'import crée toujours la version 1, sans quiz. */
export function courseFromImport(dto: CoursImporteHttpDto, titre: string): Course {
  return {
    ...DEFAULTS,
    id: String(dto.idCours),
    title: titre.trim(),
    currentVersion: 1,
    pageCount: dto.nbPages,
    quizCount: 0,
    leaderboardCount: 0,
    updatedAt: new Date(),
  }
}

function toInsertion(dto: InsertionCoursHttpDto, questionCounts: Map<number, number>): Insertion {
  return {
    id: String(dto.idInsertion),
    kind: dto.type === 'QUIZ' ? 'quiz' : 'leaderboard',
    title: dto.titre,
    questionCount: dto.idQuiz != null ? questionCounts.get(dto.idQuiz) : undefined,
    afterPage: dto.apresPage,
    order: dto.ordre,
  }
}

export function toCourseStructure(dto: CoursDetailHttpDto, quizzes: QuizResumeHttpDto[]): CourseStructure {
  const questionCounts = new Map(quizzes.map((q) => [q.idQuiz, q.nbQuestions]))
  return {
    courseId: String(dto.idCours),
    title: dto.titre,
    version: dto.version,
    pageCount: dto.nbPages,
    locked: false,
    archived: false,
    insertions: dto.insertions.map((i) => toInsertion(i, questionCounts)),
  }
}

export function toPositionsHttpDto(placements: InsertionPlacement[]): PositionInsertionHttpDto[] {
  return placements.map((p) => ({ idInsertion: Number(p.id), apresPage: p.afterPage }))
}
