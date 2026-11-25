import type { MockServer } from '@/mocks/server/MockServer'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import type { NewQuiz, Quiz } from '../../domain/Quiz'
import type { QuizRepository } from '../../domain/QuizRepository'
import { toNewQuizDto, toQuiz } from '../QuizDto'

/** Implémentation mock : interroge le faux back-end en mémoire, puis mappe DTO → domaine. */
export class MockQuizRepository implements QuizRepository {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  createQuiz(courseId: string, quiz: NewQuiz): Promise<Quiz> {
    return withAppErrors(async () => toQuiz(await this.server.createQuiz(courseId, toNewQuizDto(quiz))))
  }
}
