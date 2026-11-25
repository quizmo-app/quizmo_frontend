import { useState } from 'react'
import type { FormEvent } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import type { Insertion, NewInsertion } from '../domain/Insertion'
import type { InsertionRepository } from '../domain/InsertionRepository'
import { validatePosition, validateQuizId } from '../domain/validation'

/** Orchestration du formulaire d'insertion d'un quiz existant (CU1.4). */
export function useInsertQuiz(
  repository: InsertionRepository,
  courseId: string,
  pageCount: number,
  onInserted: (insertion: Insertion) => void,
  initialAfterPage = 0,
) {
  const [quizId, setQuizId] = useState('')
  const [afterPage, setAfterPage] = useState(initialAfterPage)
  const [quizIdError, setQuizIdError] = useState<ReturnType<typeof validateQuizId>>(null)
  const [positionError, setPositionError] = useState<ReturnType<typeof validatePosition>>(null)
  const [state, setState] = useState<AsyncState<Insertion>>({ status: 'idle' })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const quizIdValidationError = validateQuizId(quizId)
    const positionValidationError = validatePosition(afterPage, pageCount)
    setQuizIdError(quizIdValidationError)
    setPositionError(positionValidationError)
    if (quizIdValidationError || positionValidationError) return

    const newInsertion: NewInsertion = { quizId: quizId.trim(), afterPage }
    setState({ status: 'loading' })
    try {
      const insertion = await repository.insertQuiz(courseId, newInsertion)
      setState({ status: 'success', data: insertion })
      onInserted(insertion)
    } catch (error) {
      setState({ status: 'error', error: AppError.from(error) })
    }
  }

  return { quizId, setQuizId, afterPage, setAfterPage, quizIdError, positionError, state, submit }
}
