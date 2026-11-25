import type { McqQuestion, OpenQuestion } from './Quiz'

export function newMcqQuestion(defaultDurationSeconds: number): McqQuestion {
  return {
    id: crypto.randomUUID(),
    type: 'MCQ',
    statement: '',
    durationSeconds: defaultDurationSeconds,
    allowMultiple: false,
    options: [
      { id: crypto.randomUUID(), label: '', correct: false },
      { id: crypto.randomUUID(), label: '', correct: false },
    ],
  }
}

export function newOpenQuestion(defaultDurationSeconds: number): OpenQuestion {
  return {
    id: crypto.randomUUID(),
    type: 'OPEN',
    statement: '',
    durationSeconds: defaultDurationSeconds,
    graded: true,
    acceptedAnswers: [''],
  }
}
