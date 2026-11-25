import type { NewQuiz, Quiz } from './Quiz'

/** Port (interface) : implémenté par l'infrastructure (mock aujourd'hui, HTTP demain). */
export interface QuizRepository {
  /** CU1.3/CU1.4 : crée un quiz et l'insère après la page choisie, en une seule transaction. */
  createQuiz(courseId: string, quiz: NewQuiz): Promise<Quiz>
}
