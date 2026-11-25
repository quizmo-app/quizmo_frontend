import type { MockServer } from '@/mocks/server/MockServer'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import type { Insertion, NewInsertion } from '../../domain/Insertion'
import type { InsertionRepository } from '../../domain/InsertionRepository'
import { toInsertion, toNewInsertionDto } from '../InsertionDto'

/** Implémentation mock : interroge le faux back-end en mémoire, puis mappe DTO → domaine. */
export class MockInsertionRepository implements InsertionRepository {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  insertQuiz(courseId: string, insertion: NewInsertion): Promise<Insertion> {
    return withAppErrors(async () => toInsertion(await this.server.insertQuiz(courseId, toNewInsertionDto(insertion)), insertion.quizId))
  }
}
