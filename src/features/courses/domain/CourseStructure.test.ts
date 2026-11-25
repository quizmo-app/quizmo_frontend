import { describe, expect, it } from 'vitest'
import {
  findMisplacedInsertions,
  hasPlacementChanges,
  insertionsAfter,
  moveInsertion,
  shiftInsertion,
  type Insertion,
} from './CourseStructure'

const quiz = (id: string, afterPage: number, order = 1): Insertion => ({
  id,
  kind: 'quiz',
  title: id,
  questionCount: 3,
  afterPage,
  order,
})

describe('moveInsertion', () => {
  it('place l’insertion en dernière position de la page cible', () => {
    const list = [quiz('a', 2), quiz('b', 4, 1), quiz('c', 4, 2)]
    const moved = moveInsertion(list, 'a', 4, 10)
    expect(insertionsAfter(moved, 4).map((i) => i.id)).toEqual(['b', 'c', 'a'])
    expect(insertionsAfter(moved, 4).map((i) => i.order)).toEqual([1, 2, 3])
  })

  it('borne la page cible entre 0 et N', () => {
    expect(moveInsertion([quiz('a', 2)], 'a', 99, 5)[0].afterPage).toBe(5)
    expect(moveInsertion([quiz('a', 2)], 'a', -3, 5)[0].afterPage).toBe(0)
  })
})

describe('shiftInsertion', () => {
  it('échange avec la voisine sur la même page', () => {
    const list = [quiz('a', 3, 1), quiz('b', 3, 2)]
    expect(insertionsAfter(shiftInsertion(list, 'b', -1, 5), 3).map((i) => i.id)).toEqual(['b', 'a'])
  })

  it('passe à la page précédente (en fin) ou suivante (en tête) aux extrémités', () => {
    const list = [quiz('a', 2, 1), quiz('b', 3, 1), quiz('c', 3, 2)]
    expect(insertionsAfter(shiftInsertion(list, 'b', -1, 5), 2).map((i) => i.id)).toEqual(['a', 'b'])
    const forward = shiftInsertion(list, 'a', 1, 5)
    expect(insertionsAfter(forward, 3).map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('ne sort pas des positions 0..N', () => {
    const list = [quiz('a', 0)]
    expect(shiftInsertion(list, 'a', -1, 5)).toBe(list)
    const last = [quiz('z', 5)]
    expect(shiftInsertion(last, 'z', 1, 5)).toBe(last)
  })
})

describe('contrôles de la structure', () => {
  it('détecte les modifications de position', () => {
    const saved = [quiz('a', 2)]
    expect(hasPlacementChanges(saved, [quiz('a', 2)])).toBe(false)
    expect(hasPlacementChanges(saved, [quiz('a', 3)])).toBe(true)
  })

  it('signale les insertions hors des positions 0..N', () => {
    expect(
      findMisplacedInsertions([quiz('a', -1), quiz('z', 0), quiz('b', 3), quiz('c', 7)], 5).map((i) => i.id),
    ).toEqual(['a', 'c'])
  })
})
