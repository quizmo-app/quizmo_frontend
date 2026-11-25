import type { AppErrorCode } from '@/shared/domain/AppError'

export function validateQuizId(quizId: string): AppErrorCode | null {
  return quizId.trim().length === 0 ? 'FIELD_REQUIRED' : null
}

export function validatePosition(afterPage: number, pageCount: number): AppErrorCode | null {
  if (!Number.isInteger(afterPage) || afterPage < 0 || afterPage > pageCount) return 'POSITION_INVALID'
  return null
}
