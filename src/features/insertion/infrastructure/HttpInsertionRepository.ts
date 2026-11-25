import { apiPostJson } from '../../../shared/http/apiClient'
import type { Insertion, NouvelleInsertion } from '../domain/Insertion'
import type { InsertionRepository } from '../domain/InsertionRepository'
import { dtoDepuisNouvelleInsertion, insertionDepuisDto } from './dto'
import type { InsertionReponseDto } from './dto'
import { mapErreurInsertion } from './mapErreurInsertion'

export class HttpInsertionRepository implements InsertionRepository {
  async inserer(idCours: number, idVersion: number, nouvelleInsertion: NouvelleInsertion): Promise<Insertion> {
    try {
      const dto = await apiPostJson<InsertionReponseDto>(
        `/cours/${idCours}/versions/${idVersion}/insertions`,
        dtoDepuisNouvelleInsertion(nouvelleInsertion),
      )
      return insertionDepuisDto(dto, nouvelleInsertion.idQuiz)
    } catch (erreur) {
      throw mapErreurInsertion(erreur)
    }
  }
}
