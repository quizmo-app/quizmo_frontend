import type { Insertion, NouvelleInsertion } from '../domain/Insertion'

export interface NouvelleInsertionDto {
  idQuiz: number
  apresPage: number
}

export function dtoDepuisNouvelleInsertion(nouvelleInsertion: NouvelleInsertion): NouvelleInsertionDto {
  return { idQuiz: nouvelleInsertion.idQuiz, apresPage: nouvelleInsertion.apresPage }
}

export interface InsertionReponseDto {
  idInsertion: number
  apresPage: number
  ordre: number
}

export function insertionDepuisDto(dto: InsertionReponseDto, idQuiz: number): Insertion {
  return { idInsertion: dto.idInsertion, idQuiz, apresPage: dto.apresPage, ordre: dto.ordre }
}
