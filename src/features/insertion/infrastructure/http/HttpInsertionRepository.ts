/**
 * Adaptateur HTTP du port `InsertionRepository` (QM-13) :
 * POST /api/cours/{idCours}/versions/{idVersion}/insertions (app/insertions/router.py).
 *
 * Le port ne connaît que le cours : l'identifiant de la version courante (`idVersion`, distinct
 * du numéro de version) est relu au préalable via GET /api/cours/{id}.
 * `idQuiz` doit être un entier : un identifiant saisi non numérique est envoyé tel quel et le
 * back-end répond 422 QUIZ_INVALIDE, comme le mock pour un quiz invalide.
 */
import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import { requestJson } from '@/shared/infrastructure/http/httpClient'
import type { Insertion, NewInsertion } from '../../domain/Insertion'
import type { InsertionRepository } from '../../domain/InsertionRepository'

interface CoursVersionHttpDto {
  idVersion: number
}

interface InsertionCreateHttpDto {
  idQuiz: number | string
  apresPage: number
}

interface InsertionCreatedHttpDto {
  idInsertion: number
  apresPage: number
  ordre: number
}

export class HttpInsertionRepository implements InsertionRepository {
  insertQuiz(courseId: string, insertion: NewInsertion): Promise<Insertion> {
    return withAppErrors(async () => {
      const { idVersion } = await requestJson<CoursVersionHttpDto>(`/cours/${courseId}`)
      const trimmed = insertion.quizId.trim()
      const body: InsertionCreateHttpDto = {
        idQuiz: /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed,
        apresPage: insertion.afterPage,
      }
      const dto = await requestJson<InsertionCreatedHttpDto>(`/cours/${courseId}/versions/${idVersion}/insertions`, {
        method: 'POST',
        json: body,
      })
      return { id: String(dto.idInsertion), quizId: trimmed, afterPage: dto.apresPage, order: dto.ordre }
    })
  }
}
