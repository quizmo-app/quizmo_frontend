import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AsyncState } from '../../../shared/AsyncState'
import { AppError } from '../../../shared/errors/AppError'
import type { Insertion, NouvelleInsertion } from '../domain/Insertion'
import type { InsertionRepository } from '../domain/InsertionRepository'
import { validerIdQuiz, validerPage } from '../domain/validation'

export function useInsererQuiz(
  insertionRepository: InsertionRepository,
  idCours: number,
  idVersion: number,
  nbPagesCours: number,
  onInsere: (insertion: Insertion) => void,
) {
  const [idQuiz, setIdQuiz] = useState<number | null>(null)
  const [apresPage, setApresPage] = useState(0)
  const [erreurIdQuiz, setErreurIdQuiz] = useState<string | null>(null)
  const [erreurPage, setErreurPage] = useState<string | null>(null)
  const [etat, setEtat] = useState<AsyncState<Insertion>>({ status: 'idle' })

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()

    const erreurQuiz = validerIdQuiz(idQuiz)
    const erreurPageCalculee = validerPage(apresPage, nbPagesCours)
    setErreurIdQuiz(erreurQuiz)
    setErreurPage(erreurPageCalculee)
    if (erreurQuiz || erreurPageCalculee) {
      return
    }

    const nouvelleInsertion: NouvelleInsertion = { idQuiz: idQuiz!, apresPage }
    setEtat({ status: 'loading' })
    try {
      const insertion = await insertionRepository.inserer(idCours, idVersion, nouvelleInsertion)
      setEtat({ status: 'success', data: insertion })
      onInsere(insertion)
    } catch (erreur) {
      const appError =
        erreur instanceof AppError ? erreur : new AppError('ERREUR_INCONNUE', 'Une erreur inattendue est survenue. Réessayez.')
      setEtat({ status: 'error', error: appError })
    }
  }

  return { idQuiz, setIdQuiz, apresPage, setApresPage, erreurIdQuiz, erreurPage, etat, soumettre }
}
