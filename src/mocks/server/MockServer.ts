import type {
  CoursDto,
  InsertionDto,
  StructureCoursDto,
  StructurePositionsDto,
} from '@/features/courses/infrastructure/CourseDto'
import type { PageDto, PlanPresentationDto } from '@/features/course-presentation/infrastructure/PresentationDto'
import { ApiError, NETWORK_STATUS } from '@/shared/infrastructure/http/ApiError'
import {
  courseFixtures,
  DEMO_TEACHER,
  presentationFixtures,
  type MockCourse,
  type MockPresentation,
} from './fixtures'
import { orderPlanElements } from './orderPlanElements'
import { renderPageSvg } from './renderPageSvg'

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface MockServerOptions {
  /** Latence moyenne simulée (ms). */
  latencyMs?: number
  /** Persistance des présentations / session entre rechargements (localStorage par défaut). */
  storage?: KeyValueStorage | null
}

const STORAGE_KEYS = {
  session: 'quizmo.mock.session',
  presentations: 'quizmo.mock.presentations',
  courses: 'quizmo.mock.courses',
}

/**
 * Faux back-end en mémoire reproduisant API REST + CoursService + PdfService + PostgreSQL.
 * Renvoie des DTO et lève des `ApiError` (401, 403, 404, 409, coupure réseau) comme le ferait l'API.
 * N'effectue AUCUN appel réseau.
 */
export class MockServer {
  private readonly latencyMs: number
  private readonly storage: KeyValueStorage | null
  private courses: MockCourse[]
  private presentations: MockPresentation[]
  private sessionTeacherId: string | null
  /** Pages ayant déjà échoué une fois (scénario réseau instable). */
  private readonly failedOnce = new Set<string>()

  constructor(options: MockServerOptions = {}) {
    this.latencyMs = options.latencyMs ?? 400
    this.storage = options.storage === undefined ? (globalThis.localStorage ?? null) : options.storage
    this.courses = this.read(STORAGE_KEYS.courses) ?? structuredClone(courseFixtures)
    this.presentations = this.read(STORAGE_KEYS.presentations) ?? structuredClone(presentationFixtures)
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

  /** Remet les présentations et la session dans leur état initial. */
  reset(): void {
    this.courses = structuredClone(courseFixtures)
    this.presentations = structuredClone(presentationFixtures)
    this.sessionTeacherId = DEMO_TEACHER.id
    this.failedOnce.clear()
    this.storage?.removeItem(STORAGE_KEYS.courses)
    this.storage?.removeItem(STORAGE_KEYS.presentations)
    this.storage?.removeItem(STORAGE_KEYS.session)
  }

  // ───────────────────────────── GET /cours ─────────────────────────────

  async listMyCourses(): Promise<CoursDto[]> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()
    return this.courses
      .filter((course) => course.ownerId === teacherId)
      .map((course) => {
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
          presentation_active: this.presentations.some((p) => p.courseId === course.id),
          date_maj: course.dateMaj,
        }
      })
  }

  // ───────────────────────────── GET /cours/{id}/presentation ─────────────────────────────

  async openPresentation(courseId: string): Promise<PlanPresentationDto> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()
    const course = this.courses.find((c) => c.id === courseId)
    if (!course) throw new ApiError(404, 'COURS_INTROUVABLE')
    if (course.ownerId !== teacherId) throw new ApiError(403, 'NON_PROPRIETAIRE')
    if (course.archive) throw new ApiError(409, 'COURS_ARCHIVE')
    const version = currentVersion(course)
    if (!course.pdfDisponible || !version || version.pages.length === 0) throw new ApiError(409, 'PDF_INDISPONIBLE')

    let presentation = this.presentations.find((p) => p.courseId === courseId)
    const resumed = Boolean(presentation)
    if (!presentation) {
      // Créer la présentation et figer la version courante.
      presentation = { id: `pres-${courseId}-${Date.now()}`, courseId, version: version.numero, position: 0 }
      this.presentations.push(presentation)
      this.persistPresentations()
    }
    const frozenNumber = presentation.version
    const frozen = course.versions.find((v) => v.numero === frozenNumber) ?? version

    return {
      id_presentation: presentation.id,
      cours: { id: course.id, titre: course.titre },
      version: { numero: frozen.numero, nb_pages: frozen.pages.length },
      elements: orderPlanElements(frozen.pages.length, course.insertions),
      position_courante: presentation.position,
      reprise: resumed,
    }
  }

  // ───────────────────────────── GET /cours/{id}/versions/{n}/pages/{p} ─────────────────────────────

  async getPage(courseId: string, versionNumber: number, pageNumber: number): Promise<PageDto> {
    await this.simulateNetwork()
    const teacherId = this.requireSession()
    const course = this.courses.find((c) => c.id === courseId)
    if (!course) throw new ApiError(404, 'COURS_INTROUVABLE')
    if (course.ownerId !== teacherId) throw new ApiError(403, 'NON_PROPRIETAIRE')
    const version = course.versions.find((v) => v.numero === versionNumber)
    const page = version?.pages[pageNumber - 1]
    if (!version || !page) throw new ApiError(404, 'PAGE_INTROUVABLE')

    const failureKey = `${courseId}:${pageNumber}`
    if (course.pagesEnEchecUneFois?.includes(pageNumber) && !this.failedOnce.has(failureKey)) {
      this.failedOnce.add(failureKey)
      throw new ApiError(NETWORK_STATUS, 'RESEAU', 'Coupure réseau simulée')
    }

    return {
      numero_page: pageNumber,
      type_media: 'image/svg+xml',
      url: renderPageSvg({
        courseTitle: course.titre,
        pageTitle: page.titre,
        points: page.points,
        pageNumber,
        pageCount: version.pages.length,
        version: version.numero,
        accent: course.accent,
      }),
    }
  }

  // ───────────────────────────── PUT /presentations/{id}/position (hypothèse) ─────────────────────────────

  async savePosition(presentationId: string, position: number): Promise<void> {
    await this.simulateNetwork(0.3)
    this.requireSession()
    const presentation = this.presentations.find((p) => p.id === presentationId)
    if (!presentation) throw new ApiError(404, 'PRESENTATION_INTROUVABLE')
    presentation.position = position
    this.persistPresentations()
  }

  // ───────────────────────────── POST /presentations/{id}/cloture (hypothèse) ─────────────────────────────

  async closePresentation(presentationId: string): Promise<void> {
    await this.simulateNetwork(0.5)
    this.requireSession()
    // Idempotent : clôturer une présentation déjà clôturée n'est pas une erreur.
    this.presentations = this.presentations.filter((p) => p.id !== presentationId)
    this.persistPresentations()
  }

  // ───────────────────────────── QM-17 : GET /api/v1/courses/{id}/structure ─────────────────────────────

  async getStructure(courseId: string): Promise<StructureCoursDto> {
    await this.simulateNetwork()
    return this.toStructureDto(this.ownedCourse(courseId))
  }

  // ───────────────────────────── QM-17 : PUT /api/v1/courses/{id}/structure ─────────────────────────────

  async saveStructure(courseId: string, body: StructurePositionsDto): Promise<void> {
    await this.simulateNetwork()
    const course = this.ownedCourse(courseId)
    this.assertEditable(course)
    const pageCount = currentVersion(course)?.pages.length ?? 0
    const byId = new Map(body.positions.map((p) => [p.id, p]))
    const valid =
      body.positions.length === course.insertions.length &&
      course.insertions.every((i) => byId.has(i.id)) &&
      body.positions.every((p) => Number.isInteger(p.after_page) && p.after_page >= 1 && p.after_page <= pageCount)
    if (!valid) throw new ApiError(422, 'POSITION_INVALIDE')

    course.insertions = course.insertions.map((i) => {
      const position = byId.get(i.id)!
      return { ...i, apresPage: position.after_page, ordre: position.ordre }
    })
    course.dateMaj = new Date().toISOString()
    this.persistCourses()
  }

  // ───────────────────────────── QM-17 : DELETE /api/v1/courses/{id} ─────────────────────────────

  async deleteCourse(courseId: string): Promise<void> {
    await this.simulateNetwork()
    const course = this.ownedCourse(courseId)
    if (this.isInSession(course.id)) throw new ApiError(409, 'COURS_VERROUILLE')
    // Purge RGPD : cours, versions, fichiers PDF, insertions et présentations / résultats associés.
    this.courses = this.courses.filter((c) => c.id !== courseId)
    this.presentations = this.presentations.filter((p) => p.courseId !== courseId)
    this.persistCourses()
    this.persistPresentations()
  }

  // ───────────────────────────── Interne ─────────────────────────────

  private ownedCourse(courseId: string): MockCourse {
    const teacherId = this.requireSession()
    const course = this.courses.find((c) => c.id === courseId)
    if (!course) throw new ApiError(404, 'COURS_INTROUVABLE')
    if (course.ownerId !== teacherId) throw new ApiError(403, 'NON_PROPRIETAIRE')
    return course
  }

  private isInSession(courseId: string): boolean {
    return this.presentations.some((p) => p.courseId === courseId)
  }

  private assertEditable(course: MockCourse): void {
    if (this.isInSession(course.id)) throw new ApiError(409, 'COURS_VERROUILLE')
    if (course.archive) throw new ApiError(409, 'COURS_ARCHIVE')
  }

  private toStructureDto(course: MockCourse): StructureCoursDto {
    const version = currentVersion(course)
    return {
      cours_id: course.id,
      titre: course.titre,
      version: version?.numero ?? 0,
      page_count: version?.pages.length ?? 0,
      verrouille: this.isInSession(course.id),
      archive: course.archive,
      insertions: course.insertions.map(
        (i): InsertionDto => ({
          id: i.id,
          type: i.type,
          titre: i.titre,
          nb_questions: i.nbQuestions,
          after_page: i.apresPage,
          ordre: i.ordre,
        }),
      ),
    }
  }

  private persistCourses(): void {
    this.write(STORAGE_KEYS.courses, this.courses)
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

  private persistPresentations(): void {
    this.write(STORAGE_KEYS.presentations, this.presentations)
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
