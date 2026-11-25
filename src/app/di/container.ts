import type { SessionGateway } from '@/features/auth/domain/SessionGateway'
import { MockSessionGateway } from '@/features/auth/infrastructure/mock/MockSessionGateway'
import type { PresentationRepository } from '@/features/course-presentation/domain/PresentationRepository'
import { MockPresentationRepository } from '@/features/course-presentation/infrastructure/mock/MockPresentationRepository'
import type { CourseRepository } from '@/features/courses/domain/CourseRepository'
import { MockCourseRepository } from '@/features/courses/infrastructure/mock/MockCourseRepository'
import type { InsertionRepository } from '@/features/insertion/domain/InsertionRepository'
import { MockInsertionRepository } from '@/features/insertion/infrastructure/mock/MockInsertionRepository'
import type { QuizRepository } from '@/features/quiz/domain/QuizRepository'
import { MockQuizRepository } from '@/features/quiz/infrastructure/mock/MockQuizRepository'
import { SCENARIO_IDS } from '@/mocks/server/fixtures'
import { MockServer } from '@/mocks/server/MockServer'

/** Ensemble des ports injectés dans l'application (composition root). */
export interface Dependencies {
  courseRepository: CourseRepository
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

  // Branchement futur : remplacer uniquement cette fonction par les adaptateurs HTTP
  // (HttpCourseRepository, HttpPresentationRepository, HttpQuizRepository, HttpInsertionRepository…)
  // réutilisant les mappers existants.
  throw new Error(`VITE_API_MODE="${mode}" : les adaptateurs HTTP ne sont pas encore implémentés.`)
}
