import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import { requestJson } from '@/shared/infrastructure/http/httpClient'
import type { NewQuiz, Quiz } from '../../domain/Quiz'
import type { QuizRepository } from '../../domain/QuizRepository'
import { toQuiz, toQuizCreateHttpDto, type QuizDetailHttpDto } from './QuizHttpDto'

/**
 * Adaptateur HTTP du port `QuizRepository` (QM-12) : POST /api/cours/{id}/quiz crée le quiz,
 * ses questions et son insertion en une transaction. Les erreurs 400 `VALIDATION` sont
 * ramenées au code de leur premier détail (httpClient), comme le serveur mock.
 */
export class HttpQuizRepository implements QuizRepository {
  createQuiz(courseId: string, quiz: NewQuiz): Promise<Quiz> {
    return withAppErrors(async () => {
      const dto = await requestJson<QuizDetailHttpDto>(`/cours/${courseId}/quiz`, {
        method: 'POST',
        json: toQuizCreateHttpDto(quiz),
      })
      return toQuiz(dto, quiz.afterPage)
    })
  }
}
