import { AppError } from '../../../shared/errors/AppError'
import type { NouveauQuiz, Quiz } from '../domain/Quiz'
import type { QuizRepository } from '../domain/QuizRepository'

function attendre(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let prochainIdQuiz = 1

/** Simule le backend pour développer sans API disponible (VITE_API_MODE=mock). */
export class MockQuizRepository implements QuizRepository {
  async creerQuiz(idCours: number, nouveauQuiz: NouveauQuiz): Promise<Quiz> {
    await attendre(500)

    if (nouveauQuiz.titre.trim().toLowerCase() === 'erreur') {
      throw new AppError('ERREUR_SERVEUR', 'Réessayez dans quelques minutes ou prévenez l’administrateur.')
    }

    return {
      idQuiz: prochainIdQuiz++,
      idCours,
      titre: nouveauQuiz.titre.trim(),
      apresPage: nouveauQuiz.apresPage,
      questions: nouveauQuiz.questions,
    }
  }
}
