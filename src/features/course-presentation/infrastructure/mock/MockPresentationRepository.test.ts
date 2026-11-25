import { beforeEach, describe, expect, it } from 'vitest'
import { SCENARIO_IDS } from '@/mocks/server/fixtures'
import { MockServer } from '@/mocks/server/MockServer'
import { AppError } from '@/shared/domain/AppError'
import { endPresentation, recordPosition, startPresentation } from '../../domain/useCases'
import { MockPresentationRepository } from './MockPresentationRepository'

describe('MockPresentationRepository + cas d’usage CU2.1', () => {
  let server: MockServer
  let repository: MockPresentationRepository

  beforeEach(() => {
    server = new MockServer({ latencyMs: 0, storage: null })
    repository = new MockPresentationRepository(server)
  })

  const expectCode = async (promise: Promise<unknown>, code: AppError['code']) => {
    const error = await promise.catch((e: unknown) => e)
    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).code).toBe(code)
  }

  it('crée une présentation, fige la version courante et ordonne le plan', async () => {
    const plan = await startPresentation(repository, SCENARIO_IDS.nominal)
    expect(plan.version).toBe(2)
    expect(plan.resumed).toBe(false)
    expect(plan.startIndex).toBe(0)
    expect(plan.items).toHaveLength(12 + 4)
    expect(plan.items.slice(3, 7).map((i) => i.kind)).toEqual(['course-page', 'quiz', 'leaderboard', 'course-page'])
    expect(plan.items[plan.items.length - 1].kind).toBe('leaderboard')
  })

  it('reprend une présentation active à la dernière page enregistrée', async () => {
    const plan = await startPresentation(repository, SCENARIO_IDS.resume)
    expect(plan).toMatchObject({ resumed: true, startIndex: 5 })
  })

  it('enregistre la position puis la restitue à la reprise ; la clôture libère la présentation', async () => {
    const first = await startPresentation(repository, SCENARIO_IDS.withoutInsertions)
    await recordPosition(repository, first, 3)
    const resumed = await startPresentation(repository, SCENARIO_IDS.withoutInsertions)
    expect(resumed).toMatchObject({ presentationId: first.presentationId, resumed: true, startIndex: 3 })

    await endPresentation(repository, resumed)
    const fresh = await startPresentation(repository, SCENARIO_IDS.withoutInsertions)
    expect(fresh).toMatchObject({ resumed: false, startIndex: 0 })
  })

  it('refuse les contrôles en échec avec l’erreur métier adaptée', async () => {
    await expectCode(startPresentation(repository, SCENARIO_IDS.archived), 'COURSE_ARCHIVED')
    await expectCode(startPresentation(repository, SCENARIO_IDS.pdfMissing), 'PDF_UNAVAILABLE')
    await expectCode(startPresentation(repository, SCENARIO_IDS.otherOwner), 'FORBIDDEN')
    await expectCode(startPresentation(repository, SCENARIO_IDS.unknown), 'NOT_FOUND')
  })

  it('renvoie UNAUTHENTICATED quand la session a expiré', async () => {
    await server.expireSession()
    await expectCode(startPresentation(repository, SCENARIO_IDS.nominal), 'UNAUTHENTICATED')
  })

  it('simule une coupure réseau ponctuelle sur le scénario instable', async () => {
    const plan = await startPresentation(repository, SCENARIO_IDS.flaky)
    const params = { courseId: plan.course.id, version: plan.version, pdfPage: 3 }
    await expectCode(repository.getCoursePage(params), 'NETWORK')
    await expect(repository.getCoursePage(params)).resolves.toMatchObject({ pdfPage: 3, mediaType: 'image/svg+xml' })
  })
})
