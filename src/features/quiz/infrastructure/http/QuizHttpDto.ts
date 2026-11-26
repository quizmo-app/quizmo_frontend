/**
 * Contrat réel de POST /api/cours/{idCours}/quiz (app/quizzes/schemas.py) : JSON camelCase,
 * ids numériques, durées en secondes sous `duree` / `dureeDefaut`, options `{ id, libelle, correcte }`.
 * Le DTO historique (`../QuizDto.ts`) reste celui du serveur mock.
 *
 * Valeurs envoyées ou déduites faute d'équivalent dans le domaine :
 *  - `sensibleCasse` (LIBRE) → toujours false (le formulaire ne propose pas l'option)
 *  - `afterPage` du quiz créé → `insertion.apresPage` de la réponse, sinon la page demandée
 *  - question de type RELIER → non prise en charge par le domaine (MCQ / OPEN uniquement)
 */
import type { NewQuiz, Question, Quiz } from '../../domain/Quiz'

interface QcmConfigurationHttpDto {
  options: { id: string; libelle: string; correcte: boolean }[]
  choixMultiple: boolean
}

interface LibreConfigurationHttpDto {
  reponsesAcceptees: string[]
  sensibleCasse: boolean
  note: boolean
}

type QuestionHttpDto =
  | { type: 'QCM'; enonce: string; duree: number; configuration: QcmConfigurationHttpDto }
  | { type: 'LIBRE'; enonce: string; duree: number; configuration: LibreConfigurationHttpDto }

export interface QuizCreateHttpDto {
  titre: string
  dureeDefaut: number
  apresPage: number
  questions: QuestionHttpDto[]
}

/** Réponse 201 de POST /api/cours/{id}/quiz (et de GET /api/quiz/{id}). */
export interface QuizDetailHttpDto {
  idQuiz: number
  idCours: number
  titre: string
  mode: string
  dureeDefaut: number
  insertion: { idInsertion: number; idVersion: number; apresPage: number } | null
  questions: ({ idQuestion: number; ordre: number } & (
    | { type: 'QCM'; enonce: string; duree: number; configuration: QcmConfigurationHttpDto }
    | { type: 'LIBRE'; enonce: string; duree: number; configuration: LibreConfigurationHttpDto }
    | { type: 'RELIER'; enonce: string; duree: number; configuration: unknown }
  ))[]
}

export function toQuizCreateHttpDto(quiz: NewQuiz): QuizCreateHttpDto {
  return {
    titre: quiz.title.trim(),
    dureeDefaut: quiz.defaultDurationSeconds,
    apresPage: quiz.afterPage,
    questions: quiz.questions.map(toQuestionHttpDto),
  }
}

function toQuestionHttpDto(question: Question): QuestionHttpDto {
  if (question.type === 'MCQ') {
    return {
      type: 'QCM',
      enonce: question.statement.trim(),
      duree: question.durationSeconds,
      configuration: {
        options: question.options.map((o) => ({ id: o.id, libelle: o.label.trim(), correcte: o.correct })),
        choixMultiple: question.allowMultiple,
      },
    }
  }
  return {
    type: 'LIBRE',
    enonce: question.statement.trim(),
    duree: question.durationSeconds,
    configuration: {
      reponsesAcceptees: question.acceptedAnswers.map((a) => a.trim()).filter((a) => a.length > 0),
      sensibleCasse: false,
      note: question.graded,
    },
  }
}

export function toQuiz(dto: QuizDetailHttpDto, requestedAfterPage: number): Quiz {
  const questions: Question[] = []
  for (const q of dto.questions) {
    if (q.type === 'QCM') {
      questions.push({
        id: String(q.idQuestion),
        type: 'MCQ',
        statement: q.enonce,
        durationSeconds: q.duree,
        allowMultiple: q.configuration.choixMultiple,
        options: q.configuration.options.map((o) => ({ id: o.id, label: o.libelle, correct: o.correcte })),
      })
    } else if (q.type === 'LIBRE') {
      questions.push({
        id: String(q.idQuestion),
        type: 'OPEN',
        statement: q.enonce,
        durationSeconds: q.duree,
        graded: q.configuration.note,
        acceptedAnswers: q.configuration.reponsesAcceptees,
      })
    }
  }
  return {
    id: String(dto.idQuiz),
    courseId: String(dto.idCours),
    title: dto.titre,
    afterPage: dto.insertion?.apresPage ?? requestedAfterPage,
    questions,
  }
}
