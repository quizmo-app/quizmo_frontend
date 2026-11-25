import type { Cours } from './Cours'

export interface CoursRepository {
  importerCours(titre: string, fichier: File): Promise<Cours>
}
