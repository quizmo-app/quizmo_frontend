export interface McqOption {
  id: string
  label: string
  correct: boolean
}

export interface McqQuestion {
  id: string
  type: 'MCQ'
  statement: string
  durationSeconds: number
  allowMultiple: boolean
  options: McqOption[]
}

export interface OpenQuestion {
  id: string
  type: 'OPEN'
  statement: string
  durationSeconds: number
  graded: boolean
  acceptedAnswers: string[]
}

export type Question = McqQuestion | OpenQuestion

export interface NewQuiz {
  title: string
  defaultDurationSeconds: number
  afterPage: number
  questions: Question[]
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  afterPage: number
  questions: Question[]
}
