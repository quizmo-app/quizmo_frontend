import type { Insertion, NewInsertion } from './Insertion'

/** Port (interface) : implémenté par l'infrastructure (mock aujourd'hui, HTTP demain). */
export interface InsertionRepository {
  /** CU1.4 : insère un quiz déjà créé après la page choisie, dans la version courante du cours. */
  insertQuiz(courseId: string, insertion: NewInsertion): Promise<Insertion>
}
