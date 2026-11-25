import { apiPost } from './http'
import { importerCoursMock } from './coursApiMock'
import type { Cours } from '../types/cours'

interface ImporterCoursReponse {
  idCours: number
  idVersion: number
  nbPages: number
}

export async function importerCours(titre: string, fichier: File): Promise<Cours> {
  if (import.meta.env.VITE_API_MODE === 'mock') {
    return importerCoursMock(titre, fichier)
  }

  const formData = new FormData()
  formData.append('titre', titre)
  formData.append('fichier', fichier)

  const reponse = await apiPost<ImporterCoursReponse>('/cours', formData)

  return {
    idCours: reponse.idCours,
    idVersion: reponse.idVersion,
    titre,
    versionCourante: 1,
    nbPages: reponse.nbPages,
    nbQuiz: 0,
  }
}
