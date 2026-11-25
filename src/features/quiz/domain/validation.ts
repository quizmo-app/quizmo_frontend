import type { AppErrorCode } from '@/shared/domain/AppError'
import type { McqQuestion, NewQuiz, OpenQuestion, Question } from './Quiz'

// Bornes de durée non encore fixées par le client (réserve du cahier de recette QM-12) : valeurs provisoires.
export const MIN_DURATION_SECONDS = 5
export const MAX_DURATION_SECONDS = 300

export function validateQuizTitle(title: string): AppErrorCode | null {
  return title.trim().length === 0 ? 'FIELD_REQUIRED' : null
}

export function validatePosition(afterPage: number, pageCount: number): AppErrorCode | null {
  if (!Number.isInteger(afterPage) || afterPage < 0 || afterPage > pageCount) return 'POSITION_INVALID'
  return null
}

export function validateDuration(durationSeconds: number): AppErrorCode | null {
  if (!Number.isInteger(durationSeconds) || durationSeconds < MIN_DURATION_SECONDS || durationSeconds > MAX_DURATION_SECONDS) {
    return 'DURATION_INVALID'
  }
  return null
}

export function validateMcqQuestion(question: McqQuestion): AppErrorCode[] {
  const errors: AppErrorCode[] = []

  if (question.statement.trim().length === 0) errors.push('FIELD_REQUIRED')

  const durationError = validateDuration(question.durationSeconds)
  if (durationError) errors.push(durationError)

  if (question.options.length < 2 || question.options.length > 8) errors.push('MCQ_OPTION_COUNT_INVALID')
  if (question.options.some((option) => option.label.trim().length === 0)) errors.push('FIELD_REQUIRED')

  const correctCount = question.options.filter((option) => option.correct).length
  if (correctCount === 0) {
    errors.push('MCQ_NO_CORRECT_ANSWER')
  } else if (!question.allowMultiple && correctCount > 1) {
    errors.push('MCQ_MULTIPLE_WITHOUT_FLAG')
  }

  return errors
}

export function validateOpenQuestion(question: OpenQuestion): AppErrorCode[] {
  const errors: AppErrorCode[] = []

  if (question.statement.trim().length === 0) errors.push('FIELD_REQUIRED')

  const durationError = validateDuration(question.durationSeconds)
  if (durationError) errors.push(durationError)

  if (question.graded && question.acceptedAnswers.every((answer) => answer.trim().length === 0)) {
    errors.push('OPEN_ANSWER_REQUIRED')
  }

  return errors
}

export function validateQuestion(question: Question): AppErrorCode[] {
  return question.type === 'MCQ' ? validateMcqQuestion(question) : validateOpenQuestion(question)
}

export interface QuizFormErrors {
  title: AppErrorCode | null
  position: AppErrorCode | null
  quiz: AppErrorCode | null
  byQuestion: Record<string, AppErrorCode[]>
}

export function validateQuiz(quiz: NewQuiz, pageCount: number): QuizFormErrors {
  const byQuestion: Record<string, AppErrorCode[]> = {}
  for (const question of quiz.questions) {
    const errors = validateQuestion(question)
    if (errors.length > 0) byQuestion[question.id] = errors
  }

  return {
    title: validateQuizTitle(quiz.title),
    position: validatePosition(quiz.afterPage, pageCount),
    quiz: quiz.questions.length === 0 ? 'QUIZ_NO_QUESTION' : null,
    byQuestion,
  }
}

export function isQuizFormValid(errors: QuizFormErrors): boolean {
  return !errors.title && !errors.position && !errors.quiz && Object.keys(errors.byQuestion).length === 0
}
