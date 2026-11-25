import type { CoursRepository } from '../../features/courses/domain/CoursRepository'
import { HttpCoursRepository } from '../../features/courses/infrastructure/HttpCoursRepository'
import { MockCoursRepository } from '../../features/courses/infrastructure/MockCoursRepository'
import type { QuizRepository } from '../../features/quiz/domain/QuizRepository'
import { HttpQuizRepository } from '../../features/quiz/infrastructure/HttpQuizRepository'
import { MockQuizRepository } from '../../features/quiz/infrastructure/MockQuizRepository'

export interface Container {
  coursRepository: CoursRepository
  quizRepository: QuizRepository
}

const modeMock = import.meta.env.VITE_API_MODE === 'mock'

export const container: Container = {
  coursRepository: modeMock ? new MockCoursRepository() : new HttpCoursRepository(),
  quizRepository: modeMock ? new MockQuizRepository() : new HttpQuizRepository(),
}
