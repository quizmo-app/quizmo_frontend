import { describe, expect, it } from 'vitest'
import type { PresentationPlan } from './PresentationPlan'
import { clampIndex, indexOfPdfPage, itemLabel, nextCoursePage } from './planQueries'

const plan: PresentationPlan = {
  presentationId: 'p-1',
  course: { id: 'c-1', title: 'Cours' },
  version: 1,
  pageCount: 2,
  startIndex: 0,
  resumed: false,
  items: [
    { kind: 'course-page', key: 'page-1', pdfPage: 1 },
    { kind: 'quiz', key: 'quiz', quizId: 'q', title: 'Q', questionCount: 2, afterPage: 1 },
    { kind: 'leaderboard', key: 'lb', leaderboardId: 'lb', title: 'Final', afterPage: 1 },
    { kind: 'course-page', key: 'page-2', pdfPage: 2 },
  ],
}

describe('planQueries', () => {
  it('clampIndex borne et tronque', () => {
    expect(clampIndex(plan, -5)).toBe(0)
    expect(clampIndex(plan, 10)).toBe(3)
    expect(clampIndex(plan, 1.7)).toBe(1)
  })

  it('nextCoursePage saute les insertions pour cibler le préchargement', () => {
    expect(nextCoursePage(plan, 0)).toEqual({ index: 3, item: plan.items[3] })
    expect(nextCoursePage(plan, 3)).toBeUndefined()
  })

  it('indexOfPdfPage retrouve la position d’une page PDF', () => {
    expect(indexOfPdfPage(plan, 2)).toBe(3)
    expect(indexOfPdfPage(plan, 9)).toBeUndefined()
  })

  it('itemLabel décrit chaque type d’élément', () => {
    expect(plan.items.map(itemLabel)).toEqual(['Page 1', 'Quiz · Q', 'Classement · Final', 'Page 2'])
  })
})
