export interface Insertion {
  id: string
  quizId: string
  afterPage: number
  order: number
}

export interface NewInsertion {
  quizId: string
  afterPage: number
}
