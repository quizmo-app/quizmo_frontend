import { beforeEach, describe, expect, it } from 'vitest'
import { SCENARIO_IDS } from '@/mocks/server/fixtures'
import { MockServer } from '@/mocks/server/MockServer'
import { AppError } from '@/shared/domain/AppError'
import { deleteCourse, saveStructure } from '../../domain/useCases'
import { MockCourseRepository } from './MockCourseRepository'

async function expectCode(promise: Promise<unknown>, code: AppError['code']) {
  await expect(promise).rejects.toSatisfy((e) => e instanceof AppError && e.code === code)
}

describe('QM-17 — gestion des cours (mock)', () => {
  let server: MockServer
  let repository: MockCourseRepository

  beforeEach(() => {
    server = new MockServer({ latencyMs: 0, storage: null })
    repository = new MockCourseRepository(server)
  })

  it('EF-06 : enregistre les positions et refuse une position hors pages', async () => {
    const structure = await repository.getStructure(SCENARIO_IDS.nominal)
    const moved = structure.insertions.map((i) => (i.id === 'q-tri-1' ? { ...i, afterPage: 2 } : i))
    await saveStructure(repository, structure, moved)
    const reloaded = await repository.getStructure(SCENARIO_IDS.nominal)
    expect(reloaded.insertions.find((i) => i.id === 'q-tri-1')?.afterPage).toBe(2)

    await expectCode(
      repository.saveStructure(SCENARIO_IDS.nominal, [{ id: 'q-tri-1', afterPage: 40, order: 1 }]),
      'INVALID_STRUCTURE',
    )
  })

  it('cours en séance (verrouillé) : déplacement et suppression refusés', async () => {
    const locked = await repository.getStructure(SCENARIO_IDS.resume)
    expect(locked.locked).toBe(true)
    await expectCode(saveStructure(repository, locked, locked.insertions), 'COURSE_LOCKED')
    await expectCode(
      repository.saveStructure(SCENARIO_IDS.resume, locked.insertions.map(({ id, afterPage, order }) => ({ id, afterPage, order }))),
      'COURSE_LOCKED',
    )
    await expectCode(repository.deleteCourse(SCENARIO_IDS.resume), 'COURSE_LOCKED')
  })

  it('EF-07 : supprime le cours et le retire du tableau de bord', async () => {
    await deleteCourse(repository, { id: SCENARIO_IDS.withoutInsertions, hasActivePresentation: false })
    const ids = (await repository.listMyCourses()).map((c) => c.id)
    expect(ids).not.toContain(SCENARIO_IDS.withoutInsertions)
    await expectCode(repository.getStructure(SCENARIO_IDS.withoutInsertions), 'NOT_FOUND')
  })

  it('refuse l’accès au cours d’un autre enseignant et une session expirée', async () => {
    await expectCode(repository.getStructure(SCENARIO_IDS.otherOwner), 'FORBIDDEN')
    await expectCode(repository.deleteCourse(SCENARIO_IDS.otherOwner), 'FORBIDDEN')
    await server.expireSession()
    await expectCode(repository.listMyCourses(), 'UNAUTHENTICATED')
  })
})
