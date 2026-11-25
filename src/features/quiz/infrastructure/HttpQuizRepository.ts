import { apiPostJson } from '../../../shared/http/apiClient'
import type { NouveauQuiz, Quiz } from '../domain/Quiz'
import type { QuizRepository } from '../domain/QuizRepository'
import { dtoDepuisNouveauQuiz, quizDepuisDto } from './dto'
import type { QuizReponseDto } from './dto'
import { mapErreurQuiz } from './mapErreurQuiz'

export class HttpQuizRepository implements QuizRepository {
  async creerQuiz(idCours: number, nouveauQuiz: NouveauQuiz): Promise<Quiz> {
    try {
      const dto = await apiPostJson<QuizReponseDto>(`/cours/${idCours}/quiz`, dtoDepuisNouveauQuiz(nouveauQuiz))
      return quizDepuisDto(dto)
    } catch (erreur) {
      throw mapErreurQuiz(erreur)
    }
  }
}
