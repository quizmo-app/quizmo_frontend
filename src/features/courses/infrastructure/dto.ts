import type { Cours } from '../domain/Cours'

export interface ImporterCoursReponseDto {
  idCours: number
  idVersion: number
  nbPages: number
}

export function dtoVersCours(dto: ImporterCoursReponseDto, titre: string): Cours {
  return {
    idCours: dto.idCours,
    idVersion: dto.idVersion,
    titre,
    versionCourante: 1,
    nbPages: dto.nbPages,
    nbQuiz: 0,
  }
}
