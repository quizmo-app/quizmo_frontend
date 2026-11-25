import type { CoursDto } from '@/features/courses/infrastructure/CourseDto'
import type { NewQuizDto, QuestionDto, QuizResponseDto } from '@/features/quiz/infrastructure/QuizDto'
import { ApiError, NETWORK_STATUS } from '@/shared/infrastructure/http/ApiError'
import { courseFixtures, DEMO_TEACHER, type MockCourse } from './fixtures'

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface MockServerOptions {
  /** Latence moyenne simulée (ms). */
  latencyMs?: number
  /** Persistance de la session entre rechargements (localStorage par défaut). */
  storage?: KeyValueStorage | null
}

const STORAGE_KEYS = { session: 'quizmo.mock.session' }
const MAX_FILE_SIZE = 50 * 1024 * 1024

export interface ImportCourseInput {
  titre: string
  fichier: { name: string; type: string; size: number }
}

/**
 * Faux back-end en mémoire reproduisant API REST + CoursService + PdfService + PostgreSQL.
 * Renvoie des DTO et lève des `ApiError` (400, 401, 403, 404, 413, 415, 422, 503, coupure réseau)
 * comme le ferait l'API. N'effectue AUCUN appel réseau.
 */
export class MockServer {
  private readonly latencyMs: number
  private readonly storage: KeyValueStorage | null
  private readonly courses: MockCourse[] = structuredClone(courseFixtures)
  private sessionTeacherId: string | null

  constructor(options: MockServerOptions = {}) {
    this.latencyMs = options.latencyMs ?? 400
    this.storage = options.storage === undefined ? (globalThis.localStorage ?? null) : options.storage
    const session = this.read<{ teacherId: string | null }>(STORAGE_KEYS.session)
    this.sessionTeacherId = session ? session.teacherId : DEMO_TEACHER.id
  }

  // ───────────────────────────── Auth (CU1.1, simplifié) ─────────────────────────────

  async me(): Promise<{ id: string; nom: string } | null> {
    await this.simulateNetwork()
    return this.sessionTeacherId === DEMO_TEACHER.id ? { id: DEMO_TEACHER.id, nom: DEMO_TEACHER.displayName } : null
  }

  async signIn(): Promise<{ id: string; nom: string }> {
    await this.simulateNetwork()
    this.sessionTeacherId = DEMO_TEACHER.id
    this.write(STORAGE_KEYS.session, { teacherId: this.sessionTeacherId })
    return { id: DEMO_TEACHER.id, nom: DEMO_TEACHER.displayName }
  }

  /** Simule l'expiration du JWT : les appels suivants renverront 401. */
  async expireSession(): Promise<void> {
    this.sessionTeacherId = null
    this.write(STORAGE_KEYS.session, { teacherId: null })
  }

  /** Remet la session dans son état initial (les cours importés pendant la démo restent, voir `reset`). */
  reset(): void {
    this.courses.length = 0
    this.courses.push(...structuredClone(courseFixtures))
    this.sessionTeacherId = DEMO_TEACHER.id
    this.storage?.removeItem(STORAGE_KEYS.session)
  }

  // ───────────────────────────── GET /cours ─────────────────────────────

  async listMyCourses(): Promise<CoursDto[]> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()
    return this.courses.filter((course) => course.ownerId === teacherId).map((course) => this.toCoursDto(course))
  }

  // ───────────────────────────── GET /cours/{id} ─────────────────────────────

  async getCourse(courseId: string): Promise<CoursDto> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()
    const course = this.courses.find((c) => c.id === courseId)
    if (!course) throw new ApiError(404, 'COURS_INTROUVABLE')
    if (course.ownerId !== teacherId) throw new ApiError(403, 'ACCES_REFUSE')
    return this.toCoursDto(course)
  }

  // ───────────────────────────── POST /cours (CU1.2) ─────────────────────────────

  async importCourse(input: ImportCourseInput): Promise<CoursDto> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()

    if (input.titre.trim().length === 0) throw new ApiError(400, 'TITRE_MANQUANT')
    const estPdf = input.fichier.type === 'application/pdf' || input.fichier.name.toLowerCase().endsWith('.pdf')
    if (!estPdf) throw new ApiError(415, 'FORMAT_NON_PDF')
    if (input.fichier.size > MAX_FILE_SIZE) throw new ApiError(413, 'FICHIER_TROP_VOLUMINEUX')
    // Scénarios de démonstration déclenchés par le titre, le temps que la lecture réelle du PDF soit branchée.
    if (input.titre.trim().toLowerCase() === 'illisible') throw new ApiError(422, 'PDF_ILLISIBLE')
    if (input.titre.trim().toLowerCase() === 'erreur') throw new ApiError(503, 'BDD_INDISPONIBLE')

    const pageCount = Math.max(1, Math.round(input.fichier.size / (80 * 1024)))
    const course: MockCourse = {
      id: `c-${slugify(input.titre)}-${Date.now().toString(36)}`,
      ownerId: teacherId,
      titre: input.titre.trim(),
      description: '',
      archive: false,
      pdfDisponible: true,
      dateMaj: new Date().toISOString(),
      accent: '#6c2bd9',
      versions: [
        {
          numero: 1,
          estCourante: true,
          pages: Array.from({ length: pageCount }, () => ({ titre: '', points: [] })),
        },
      ],
      insertions: [],
    }
    this.courses.push(course)
    return this.toCoursDto(course)
  }

  // ───────────────────────────── POST /cours/{idCours}/quiz (CU1.3/CU1.4) ─────────────────────────────

  async createQuiz(courseId: string, input: NewQuizDto): Promise<QuizResponseDto> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()
    const course = this.courses.find((c) => c.id === courseId)
    if (!course) throw new ApiError(404, 'COURS_INTROUVABLE')
    if (course.ownerId !== teacherId) throw new ApiError(403, 'ACCES_REFUSE')

    const pageCount = currentVersion(course)?.pages.length ?? 0
    if (input.titre.trim().length === 0) throw new ApiError(400, 'CHAMP_OBLIGATOIRE')
    if (!Number.isInteger(input.apresPage) || input.apresPage < 0 || input.apresPage > pageCount) {
      throw new ApiError(400, 'POSITION_INVALIDE')
    }
    if (input.questions.length === 0) throw new ApiError(400, 'QUIZ_SANS_QUESTION')
    input.questions.forEach((question) => this.validateQuestionDto(question))

    const ordre = course.insertions.filter((insertion) => insertion.apresPage === input.apresPage).length + 1
    const quizId = `q-${slugify(input.titre)}-${Date.now().toString(36)}`
    course.insertions.push({
      id: quizId,
      type: 'QUIZ',
      apresPage: input.apresPage,
      ordre,
      titre: input.titre.trim(),
      nbQuestions: input.questions.length,
    })

    return { id: quizId, idCours: course.id, titre: input.titre.trim(), apresPage: input.apresPage, questions: input.questions }
  }

  /** Le serveur refait toutes les vérifications (CA7) : jamais seulement celles du client. */
  private validateQuestionDto(question: QuestionDto): void {
    if (question.enonce.trim().length === 0) throw new ApiError(400, 'CHAMP_OBLIGATOIRE')
    if (!Number.isInteger(question.dureeSecondes) || question.dureeSecondes <= 0) throw new ApiError(400, 'DUREE_INVALIDE')

    if (question.type === 'QCM') {
      const configuration = question.configuration as { options: { label: string; correct: boolean }[]; choixMultiple: boolean }
      if (configuration.options.length < 2 || configuration.options.length > 8) throw new ApiError(400, 'QCM_NB_OPTIONS_INVALIDE')
      if (configuration.options.some((option) => option.label.trim().length === 0)) throw new ApiError(400, 'CHAMP_OBLIGATOIRE')
      const correctCount = configuration.options.filter((option) => option.correct).length
      if (correctCount === 0) throw new ApiError(400, 'QCM_AUCUNE_BONNE_REPONSE')
      if (!configuration.choixMultiple && correctCount > 1) throw new ApiError(400, 'QCM_CHOIX_MULTIPLE_REQUIS')
      return
    }

    const configuration = question.configuration as { reponsesAcceptees: string[]; note: boolean }
    if (configuration.note && configuration.reponsesAcceptees.every((answer) => answer.trim().length === 0)) {
      throw new ApiError(400, 'LIBRE_REPONSE_REQUISE')
    }
  }

  // ───────────────────────────── Interne ─────────────────────────────

  private toCoursDto(course: MockCourse): CoursDto {
    const version = currentVersion(course)
    return {
      id: course.id,
      titre: course.titre,
      description: course.description,
      version_courante: version?.numero ?? 0,
      nb_pages: version?.pages.length ?? 0,
      nb_quiz: course.insertions.filter((i) => i.type === 'QUIZ').length,
      nb_leaderboards: course.insertions.filter((i) => i.type === 'LEADERBOARD').length,
      archive: course.archive,
      pdf_disponible: course.pdfDisponible,
      presentation_active: false,
      date_maj: course.dateMaj,
    }
  }

  private requireSession(): string {
    if (!this.sessionTeacherId) throw new ApiError(401, 'JWT_ABSENT_OU_EXPIRE')
    return this.sessionTeacherId
  }

  private async simulateNetwork(factor = 1): Promise<void> {
    const jitter = 0.5 + Math.random()
    const delay = Math.round(this.latencyMs * factor * jitter)
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay))
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new ApiError(NETWORK_STATUS, 'RESEAU', 'Navigateur hors ligne')
    }
  }

  private read<T>(key: string): T | null {
    try {
      const raw = this.storage?.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.storage?.setItem(key, JSON.stringify(value))
    } catch {
      // Stockage indisponible (mode privé, quota) : le mock reste fonctionnel en mémoire.
    }
  }
}

function currentVersion(course: MockCourse) {
  return course.versions.find((v) => v.estCourante)
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'cours'
  )
}
