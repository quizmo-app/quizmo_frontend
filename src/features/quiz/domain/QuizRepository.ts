import type { NouveauQuiz, Quiz } from './Quiz'

export interface QuizRepository {
  creerQuiz(idCours: number, quiz: NouveauQuiz): Promise<Quiz>
}
