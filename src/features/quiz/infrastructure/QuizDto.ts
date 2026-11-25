import type { McqOption, NewQuiz, Question, Quiz } from '../domain/Quiz'

interface McqConfigurationDto {
  options: McqOption[]
  choixMultiple: boolean
}

interface OpenConfigurationDto {
  reponsesAcceptees: string[]
  sensibleCasse: boolean
  note: boolean
}

export interface QuestionDto {
  type: 'QCM' | 'LIBRE'
  enonce: string
  dureeSecondes: number
  configuration: McqConfigurationDto | OpenConfigurationDto
}

/** Contrat attendu de POST /cours/{idCours}/quiz (dossier de conception §4.3, hypothèse). */
export interface NewQuizDto {
  titre: string
  dureeDefautSecondes: number
  apresPage: number
  questions: QuestionDto[]
}

export function toNewQuizDto(quiz: NewQuiz): NewQuizDto {
  return {
    titre: quiz.title.trim(),
    dureeDefautSecondes: quiz.defaultDurationSeconds,
    apresPage: quiz.afterPage,
    questions: quiz.questions.map(toQuestionDto),
  }
}

function toQuestionDto(question: Question): QuestionDto {
  if (question.type === 'MCQ') {
    return {
      type: 'QCM',
      enonce: question.statement.trim(),
      dureeSecondes: question.durationSeconds,
      configuration: {
        options: question.options.map((option) => ({ id: option.id, label: option.label.trim(), correct: option.correct })),
        choixMultiple: question.allowMultiple,
      },
    }
  }
  return {
    type: 'LIBRE',
    enonce: question.statement.trim(),
    dureeSecondes: question.durationSeconds,
    configuration: {
      reponsesAcceptees: question.acceptedAnswers.map((answer) => answer.trim()).filter((answer) => answer.length > 0),
      sensibleCasse: false,
      note: question.graded,
    },
  }
}

export interface QuizResponseDto {
  id: string
  idCours: string
  titre: string
  apresPage: number
  questions: QuestionDto[]
}

export function toQuiz(dto: QuizResponseDto): Quiz {
  return {
    id: dto.id,
    courseId: dto.idCours,
    title: dto.titre,
    afterPage: dto.apresPage,
    questions: dto.questions.map(toQuestion),
  }
}

function toQuestion(dto: QuestionDto): Question {
  if (dto.type === 'QCM') {
    const configuration = dto.configuration as McqConfigurationDto
    return {
      id: crypto.randomUUID(),
      type: 'MCQ',
      statement: dto.enonce,
      durationSeconds: dto.dureeSecondes,
      allowMultiple: configuration.choixMultiple,
      options: configuration.options,
    }
  }
  const configuration = dto.configuration as OpenConfigurationDto
  return {
    id: crypto.randomUUID(),
    type: 'OPEN',
    statement: dto.enonce,
    durationSeconds: dto.dureeSecondes,
    graded: configuration.note,
    acceptedAnswers: configuration.reponsesAcceptees,
  }
}
