import { useState } from 'react'
import type { FormEvent } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import { newMcqQuestion, newOpenQuestion } from '../domain/questionFactory'
import type { NewQuiz, Question, Quiz } from '../domain/Quiz'
import type { QuizRepository } from '../domain/QuizRepository'
import { isQuizFormValid, validateQuiz } from '../domain/validation'
import type { QuizFormErrors } from '../domain/validation'

const EMPTY_ERRORS: QuizFormErrors = { title: null, position: null, quiz: null, byQuestion: {} }

/** Orchestration de l'éditeur de quiz (CU1.3/CU1.4) : saisie, validation client, soumission. */
export function useCreateQuiz(
  repository: QuizRepository,
  courseId: string,
  pageCount: number,
  initialAfterPage: number,
  onCreated: (quiz: Quiz) => void,
) {
  const [title, setTitle] = useState('')
  const [defaultDurationSeconds, setDefaultDurationSeconds] = useState(30)
  const [afterPage, setAfterPage] = useState(initialAfterPage)
  const [questions, setQuestions] = useState<Question[]>([])
  const [errors, setErrors] = useState<QuizFormErrors>(EMPTY_ERRORS)
  const [state, setState] = useState<AsyncState<Quiz>>({ status: 'idle' })

  function addMcqQuestion() {
    setQuestions((previous) => [...previous, newMcqQuestion(defaultDurationSeconds)])
  }

  function addOpenQuestion() {
    setQuestions((previous) => [...previous, newOpenQuestion(defaultDurationSeconds)])
  }

  function updateQuestion(id: string, question: Question) {
    setQuestions((previous) => previous.map((q) => (q.id === id ? question : q)))
  }

  function removeQuestion(id: string) {
    setQuestions((previous) => previous.filter((question) => question.id !== id))
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((previous) => {
      const target = index + direction
      if (target < 0 || target >= previous.length) return previous
      const copy = [...previous]
      const [item] = copy.splice(index, 1)
      copy.splice(target, 0, item)
      return copy
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const newQuiz: NewQuiz = { title, defaultDurationSeconds, afterPage, questions }
    const validationErrors = validateQuiz(newQuiz, pageCount)
    setErrors(validationErrors)
    if (!isQuizFormValid(validationErrors)) return

    setState({ status: 'loading' })
    try {
      const quiz = await repository.createQuiz(courseId, newQuiz)
      setState({ status: 'success', data: quiz })
      onCreated(quiz)
    } catch (error) {
      setState({ status: 'error', error: AppError.from(error) })
    }
  }

  return {
    title,
    setTitle,
    defaultDurationSeconds,
    setDefaultDurationSeconds,
    afterPage,
    setAfterPage,
    questions,
    addMcqQuestion,
    addOpenQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    errors,
    state,
    submit,
  }
}
