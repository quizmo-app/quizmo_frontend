import type { SessionGateway } from '@/features/auth/domain/SessionGateway'
import { HttpSessionGateway } from '@/features/auth/infrastructure/http/HttpSessionGateway'
import { MockSessionGateway } from '@/features/auth/infrastructure/mock/MockSessionGateway'
import type { PresentationRepository } from '@/features/course-presentation/domain/PresentationRepository'
import { HttpPresentationRepository } from '@/features/course-presentation/infrastructure/http/HttpPresentationRepository'
import { MockPresentationRepository } from '@/features/course-presentation/infrastructure/mock/MockPresentationRepository'
import type { CourseRepository, PageThumbnailRenderer } from '@/features/courses/domain/CourseRepository'
import { HttpCourseRepository } from '@/features/courses/infrastructure/http/HttpCourseRepository'
import { HttpPageThumbnailRenderer } from '@/features/courses/infrastructure/http/HttpPageThumbnailRenderer'
import {
  MockCourseRepository,
  MockPageThumbnailRenderer,
} from '@/features/courses/infrastructure/mock/MockCourseRepository'
import type { InsertionRepository } from '@/features/insertion/domain/InsertionRepository'
import { HttpInsertionRepository } from '@/features/insertion/infrastructure/http/HttpInsertionRepository'
import { MockInsertionRepository } from '@/features/insertion/infrastructure/mock/MockInsertionRepository'
import type { QuizRepository } from '@/features/quiz/domain/QuizRepository'
import { HttpQuizRepository } from '@/features/quiz/infrastructure/http/HttpQuizRepository'
import { MockQuizRepository } from '@/features/quiz/infrastructure/mock/MockQuizRepository'
import { SCENARIO_IDS } from '@/mocks/server/fixtures'
import { MockServer } from '@/mocks/server/MockServer'

/** Ensemble des ports injectés dans l'application (composition root). */
export interface Dependencies {
  courseRepository: CourseRepository
  pageThumbnailRenderer: PageThumbnailRenderer
  presentationRepository: PresentationRepository
  quizRepository: QuizRepository
  insertionRepository: InsertionRepository
  sessionGateway: SessionGateway
  /** Outils de démonstration, présents uniquement en mode mock. */
  devTools?: DevTools
}

export interface DevTools {
  resetMockData(): void
  expireSession(): Promise<void>
  /** Scénarios inaccessibles depuis la liste des cours (cours d'un autre enseignant, cours inexistant). */
  scenarios: { label: string; description: string; courseId: string }[]
}

export function createDependencies(): Dependencies {
  const mode = import.meta.env.VITE_API_MODE ?? 'mock'

  if (mode === 'mock') {
    const server = new MockServer({ latencyMs: Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 400) })
    return {
      courseRepository: new MockCourseRepository(server),
      pageThumbnailRenderer: new MockPageThumbnailRenderer(server),
      presentationRepository: new MockPresentationRepository(server),
      quizRepository: new MockQuizRepository(server),
      insertionRepository: new MockInsertionRepository(server),
      sessionGateway: new MockSessionGateway(server),
      devTools: {
        resetMockData: () => server.reset(),
        expireSession: () => server.expireSession(),
        scenarios: [
          { label: '403 · Autre propriétaire', description: "Cours d'un autre enseignant", courseId: SCENARIO_IDS.otherOwner },
          { label: '404 · Cours introuvable', description: "Identifiant inconnu", courseId: SCENARIO_IDS.unknown },
        ],
      },
    }
  }

  if (mode === 'http') {
    // Back-end FastAPI réel, via le proxy Vite `/api` → http://localhost:8000 (pas d'outils de démo).
    return {
      courseRepository: new HttpCourseRepository(),
      pageThumbnailRenderer: new HttpPageThumbnailRenderer(),
      presentationRepository: new HttpPresentationRepository(),
      quizRepository: new HttpQuizRepository(),
      insertionRepository: new HttpInsertionRepository(),
      sessionGateway: new HttpSessionGateway(),
    }
  }

  throw new Error(`VITE_API_MODE="${mode}" inconnu : utilisez "mock" ou "http".`)
}
