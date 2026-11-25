import { apiPost } from '../../../shared/http/apiClient'
import type { Cours } from '../domain/Cours'
import type { CoursRepository } from '../domain/CoursRepository'
import { dtoVersCours, type ImporterCoursReponseDto } from './dto'
import { mapErreurImportCours } from './mapErreurImportCours'

export class HttpCoursRepository implements CoursRepository {
  async importerCours(titre: string, fichier: File): Promise<Cours> {
    const formData = new FormData()
    formData.append('titre', titre)
    formData.append('fichier', fichier)

    try {
      const dto = await apiPost<ImporterCoursReponseDto>('/cours', formData)
      return dtoVersCours(dto, titre)
    } catch (erreur) {
      throw mapErreurImportCours(erreur)
    }
  }
}
