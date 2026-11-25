import { AppError } from '../../../shared/errors/AppError'
import type { Cours } from '../domain/Cours'
import type { CoursRepository } from '../domain/CoursRepository'

function attendre(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let prochainIdCours = 1

/**
 * Simule le backend pour développer sans API disponible (VITE_API_MODE=mock).
 * Saisir "erreur" comme titre déclenche le cas BDD_INDISPONIBLE pour tester l'état d'échec.
 */
export class MockCoursRepository implements CoursRepository {
  async importerCours(titre: string, fichier: File): Promise<Cours> {
    await attendre(600)

    if (titre.trim().toLowerCase() === 'erreur') {
      throw new AppError('BDD_INDISPONIBLE', 'Réessayez dans quelques minutes ou prévenez l’administrateur.')
    }

    return {
      idCours: prochainIdCours++,
      idVersion: 1,
      titre,
      versionCourante: 1,
      nbPages: Math.max(1, Math.round(fichier.size / (80 * 1024))),
      nbQuiz: 0,
    }
  }
}
