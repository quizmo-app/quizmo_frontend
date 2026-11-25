import { AppError } from '../../../shared/errors/AppError'
import type { Insertion, NouvelleInsertion } from '../domain/Insertion'
import type { InsertionRepository } from '../domain/InsertionRepository'

function attendre(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let prochainIdInsertion = 1
const ordreParEmplacement = new Map<string, number>()
const quizDejaInseres = new Set<number>()

/**
 * Simule le backend pour développer sans API disponible (VITE_API_MODE=mock).
 * idQuiz = 999999 simule un quiz déjà inséré (QUIZ_DEJA_INSERE) ; un même idQuiz inséré deux fois le simule aussi.
 */
export class MockInsertionRepository implements InsertionRepository {
  async inserer(idCours: number, idVersion: number, nouvelleInsertion: NouvelleInsertion): Promise<Insertion> {
    await attendre(400)

    if (nouvelleInsertion.idQuiz === 999999 || quizDejaInseres.has(nouvelleInsertion.idQuiz)) {
      throw new AppError(
        'QUIZ_DEJA_INSERE',
        'Ce quiz est déjà inséré dans cette version. Déplacez l’insertion existante ou choisissez un autre quiz.',
      )
    }

    const emplacement = `${idCours}:${idVersion}:${nouvelleInsertion.apresPage}`
    const ordrePrecedent = ordreParEmplacement.get(emplacement) ?? 0
    const ordre = ordrePrecedent + 1
    ordreParEmplacement.set(emplacement, ordre)
    quizDejaInseres.add(nouvelleInsertion.idQuiz)

    return {
      idInsertion: prochainIdInsertion++,
      idQuiz: nouvelleInsertion.idQuiz,
      apresPage: nouvelleInsertion.apresPage,
      ordre,
    }
  }
}
