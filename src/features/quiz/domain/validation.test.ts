import { describe, expect, it } from 'vitest'
import { newMcqQuestion, newOpenQuestion } from './questionFactory'
import { isQuizFormValid, validateMcqQuestion, validateOpenQuestion, validateQuiz } from './validation'
import type { NewQuiz } from './Quiz'

describe('validateMcqQuestion', () => {
  it('accepte un QCM valide à une bonne réponse', () => {
    const question = newMcqQuestion(30)
    question.statement = 'Quelle commande lit des données ?'
    question.options[0].label = 'SELECT'
    question.options[0].correct = true
    question.options[1].label = 'DELETE'
    expect(validateMcqQuestion(question)).toEqual([])
  })

  it('refuse un QCM à une seule option', () => {
    const question = newMcqQuestion(30)
    question.statement = 'Énoncé'
    question.options = [{ id: '1', label: 'Seule option', correct: true }]
    expect(validateMcqQuestion(question)).toContain('MCQ_OPTION_COUNT_INVALID')
  })

  it('refuse un QCM sans bonne réponse', () => {
    const question = newMcqQuestion(30)
    question.statement = 'Énoncé'
    question.options[0].label = 'A'
    question.options[1].label = 'B'
    expect(validateMcqQuestion(question)).toContain('MCQ_NO_CORRECT_ANSWER')
  })

  it('refuse plusieurs bonnes réponses sans choix multiple', () => {
    const question = newMcqQuestion(30)
    question.statement = 'Énoncé'
    question.options[0].label = 'A'
    question.options[0].correct = true
    question.options[1].label = 'B'
    question.options[1].correct = true
    expect(validateMcqQuestion(question)).toContain('MCQ_MULTIPLE_WITHOUT_FLAG')
  })
})

describe('validateOpenQuestion', () => {
  it('accepte une question libre non notée sans réponse acceptée', () => {
    const question = newOpenQuestion(30)
    question.statement = 'Énoncé'
    question.graded = false
    question.acceptedAnswers = []
    expect(validateOpenQuestion(question)).toEqual([])
  })

  it('refuse une question notée sans réponse acceptée', () => {
    const question = newOpenQuestion(30)
    question.statement = 'Énoncé'
    question.graded = true
    question.acceptedAnswers = ['']
    expect(validateOpenQuestion(question)).toContain('OPEN_ANSWER_REQUIRED')
  })
})

describe('validateQuiz / isQuizFormValid', () => {
  it('refuse un quiz sans question', () => {
    const quiz: NewQuiz = { title: 'Titre', defaultDurationSeconds: 30, afterPage: 0, questions: [] }
    const errors = validateQuiz(quiz, 10)
    expect(errors.quiz).toBe('QUIZ_NO_QUESTION')
    expect(isQuizFormValid(errors)).toBe(false)
  })

  it('refuse une position hors du cours', () => {
    const question = newMcqQuestion(30)
    question.statement = 'Énoncé'
    question.options[0].label = 'A'
    question.options[0].correct = true
    question.options[1].label = 'B'
    const quiz: NewQuiz = { title: 'Titre', defaultDurationSeconds: 30, afterPage: 99, questions: [question] }
    expect(validateQuiz(quiz, 10).position).toBe('POSITION_INVALID')
  })

  it('accepte un quiz valide', () => {
    const question = newMcqQuestion(30)
    question.statement = 'Énoncé'
    question.options[0].label = 'A'
    question.options[0].correct = true
    question.options[1].label = 'B'
    const quiz: NewQuiz = { title: 'Titre', defaultDurationSeconds: 30, afterPage: 4, questions: [question] }
    expect(isQuizFormValid(validateQuiz(quiz, 10))).toBe(true)
  })
})
