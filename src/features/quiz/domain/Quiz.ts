export interface OptionQcm {
  id: string
  libelle: string
  correcte: boolean
}

export interface QuestionQcm {
  id: string
  type: 'QCM'
  enonce: string
  dureeSecondes: number
  choixMultiple: boolean
  options: OptionQcm[]
}

export interface QuestionLibre {
  id: string
  type: 'LIBRE'
  enonce: string
  dureeSecondes: number
  notee: boolean
  reponsesAcceptees: string[]
}

export type Question = QuestionQcm | QuestionLibre

export interface NouveauQuiz {
  titre: string
  dureeDefautSecondes: number
  apresPage: number
  questions: Question[]
}

export interface Quiz {
  idQuiz: number
  idCours: number
  titre: string
  apresPage: number
  questions: Question[]
}
