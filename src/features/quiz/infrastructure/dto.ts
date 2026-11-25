import type { NouveauQuiz, OptionQcm, Question, Quiz } from '../domain/Quiz'

interface ConfigurationQcmDto {
  options: OptionQcm[]
  choixMultiple: boolean
}

interface ConfigurationLibreDto {
  reponsesAcceptees: string[]
  sensibleCasse: boolean
  note: boolean
}

interface QuestionDto {
  type: 'QCM' | 'LIBRE'
  enonce: string
  dureeSecondes: number
  configuration: ConfigurationQcmDto | ConfigurationLibreDto
}

export interface NouveauQuizDto {
  titre: string
  dureeDefautSecondes: number
  apresPage: number
  questions: QuestionDto[]
}

export function dtoDepuisNouveauQuiz(nouveauQuiz: NouveauQuiz): NouveauQuizDto {
  return {
    titre: nouveauQuiz.titre.trim(),
    dureeDefautSecondes: nouveauQuiz.dureeDefautSecondes,
    apresPage: nouveauQuiz.apresPage,
    questions: nouveauQuiz.questions.map(dtoDepuisQuestion),
  }
}

function dtoDepuisQuestion(question: Question): QuestionDto {
  if (question.type === 'QCM') {
    return {
      type: 'QCM',
      enonce: question.enonce.trim(),
      dureeSecondes: question.dureeSecondes,
      configuration: {
        options: question.options.map((option) => ({ id: option.id, libelle: option.libelle.trim(), correcte: option.correcte })),
        choixMultiple: question.choixMultiple,
      },
    }
  }

  return {
    type: 'LIBRE',
    enonce: question.enonce.trim(),
    dureeSecondes: question.dureeSecondes,
    configuration: {
      reponsesAcceptees: question.reponsesAcceptees.map((reponse) => reponse.trim()).filter((reponse) => reponse.length > 0),
      sensibleCasse: false,
      note: question.notee,
    },
  }
}

export interface QuizReponseDto {
  idQuiz: number
  idCours: number
  titre: string
  apresPage: number
  questions: QuestionDto[]
}

export function quizDepuisDto(dto: QuizReponseDto): Quiz {
  return {
    idQuiz: dto.idQuiz,
    idCours: dto.idCours,
    titre: dto.titre,
    apresPage: dto.apresPage,
    questions: dto.questions.map(questionDepuisDto),
  }
}

function questionDepuisDto(dto: QuestionDto, index: number): Question {
  if (dto.type === 'QCM') {
    const configuration = dto.configuration as ConfigurationQcmDto
    return {
      id: `question-${index}`,
      type: 'QCM',
      enonce: dto.enonce,
      dureeSecondes: dto.dureeSecondes,
      choixMultiple: configuration.choixMultiple,
      options: configuration.options,
    }
  }

  const configuration = dto.configuration as ConfigurationLibreDto
  return {
    id: `question-${index}`,
    type: 'LIBRE',
    enonce: dto.enonce,
    dureeSecondes: dto.dureeSecondes,
    notee: configuration.note,
    reponsesAcceptees: configuration.reponsesAcceptees,
  }
}
