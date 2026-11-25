import type { Insertion, NouvelleInsertion } from './Insertion'

export interface InsertionRepository {
  inserer(idCours: number, idVersion: number, nouvelleInsertion: NouvelleInsertion): Promise<Insertion>
}
