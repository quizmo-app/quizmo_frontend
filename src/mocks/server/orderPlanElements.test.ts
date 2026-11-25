import { describe, expect, it } from 'vitest'
import { orderPlanElements } from './orderPlanElements'

describe('orderPlanElements (réplique mock de CoursService)', () => {
  it('intercale les insertions après la page p, triées par ordre', () => {
    const elements = orderPlanElements(3, [
      { id: 'lb', type: 'LEADERBOARD', apresPage: 2, ordre: 2, titre: 'LB' },
      { id: 'q', type: 'QUIZ', apresPage: 2, ordre: 1, titre: 'Q', nbQuestions: 4 },
    ])
    expect(elements.map((e) => (e.type === 'PAGE' ? e.numero_page : e.type))).toEqual([1, 2, 'QUIZ', 'LEADERBOARD', 3])
  })

  it('place p = 0 avant la première page et p > n en fin de plan', () => {
    const elements = orderPlanElements(2, [
      { id: 'debut', type: 'QUIZ', apresPage: 0, ordre: 1, titre: 'Début' },
      { id: 'fin', type: 'LEADERBOARD', apresPage: 99, ordre: 1, titre: 'Fin' },
    ])
    expect(elements.map((e) => (e.type === 'PAGE' ? e.numero_page : e.type))).toEqual(['QUIZ', 1, 2, 'LEADERBOARD'])
  })

  it('renvoie uniquement les pages sans insertion', () => {
    expect(orderPlanElements(2, [])).toEqual([
      { type: 'PAGE', numero_page: 1 },
      { type: 'PAGE', numero_page: 2 },
    ])
  })
})
