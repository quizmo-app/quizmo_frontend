import type { Insertion, NewInsertion } from '../domain/Insertion'

/** Contrat attendu de POST /cours/{idCours}/versions/{idVersion}/insertions (QM-13, hypothèse). */
export interface NewInsertionDto {
  idQuiz: string
  apresPage: number
}

export function toNewInsertionDto(insertion: NewInsertion): NewInsertionDto {
  return { idQuiz: insertion.quizId, apresPage: insertion.afterPage }
}

export interface InsertionResponseDto {
  idInsertion: string
  apresPage: number
  ordre: number
}

export function toInsertion(dto: InsertionResponseDto, quizId: string): Insertion {
  return { id: dto.idInsertion, quizId, afterPage: dto.apresPage, order: dto.ordre }
}
