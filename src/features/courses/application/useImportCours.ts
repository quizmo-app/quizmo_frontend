import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AsyncState } from '../../../shared/AsyncState'
import { AppError } from '../../../shared/errors/AppError'
import type { Cours } from '../domain/Cours'
import type { CoursRepository } from '../domain/CoursRepository'
import { validerFichier, validerTitre } from '../domain/validation'

export function useImportCours(coursRepository: CoursRepository, onImporte: (cours: Cours) => void) {
  const [titre, setTitre] = useState('')
  const [fichier, setFichier] = useState<File | null>(null)
  const [etat, setEtat] = useState<AsyncState<Cours>>({ status: 'idle' })

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()

    const erreurTitre = validerTitre(titre)
    if (erreurTitre) {
      setEtat({ status: 'error', error: new AppError('VALIDATION_TITRE', erreurTitre) })
      return
    }

    const erreurFichier = validerFichier(fichier)
    if (erreurFichier) {
      setEtat({ status: 'error', error: new AppError('VALIDATION_FICHIER', erreurFichier) })
      return
    }

    setEtat({ status: 'loading' })
    try {
      const cours = await coursRepository.importerCours(titre.trim(), fichier!)
      setEtat({ status: 'success', data: cours })
      onImporte(cours)
    } catch (erreur) {
      const appError =
        erreur instanceof AppError ? erreur : new AppError('ERREUR_INCONNUE', 'Une erreur inattendue est survenue. Réessayez.')
      setEtat({ status: 'error', error: appError })
    }
  }

  return { titre, setTitre, fichier, setFichier, etat, soumettre }
}
