import type { MockServer } from '@/mocks/server/MockServer'
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import type { SessionGateway, Teacher } from '../../domain/SessionGateway'

export class MockSessionGateway implements SessionGateway {
  private readonly server: MockServer

  constructor(server: MockServer) {
    this.server = server
  }

  currentTeacher(): Promise<Teacher | null> {
    return withAppErrors(async () => {
      const me = await this.server.me()
      return me ? { id: me.id, displayName: me.nom } : null
    })
  }

  signIn(): Promise<Teacher> {
    return withAppErrors(async () => {
      const me = await this.server.signIn()
      return { id: me.id, displayName: me.nom }
    })
  }
}
