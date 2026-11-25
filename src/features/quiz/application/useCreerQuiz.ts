import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AsyncState } from '../../../shared/AsyncState'
import { AppError } from '../../../shared/errors/AppError'
import { nouvelleQuestionLibre, nouvelleQuestionQcm } from '../domain/questionFactory'
import type { NouveauQuiz, Question, Quiz } from '../domain/Quiz'
import type { QuizRepository } from '../domain/QuizRepository'
import { formulaireValide, validerQuiz } from '../domain/validation'
import type { ErreursFormulaireQuiz } from '../domain/validation'

const ERREURS_VIDES: ErreursFormulaireQuiz = { titre: null, position: null, quiz: null, parQuestion: {} }

export function useCreerQuiz(
  quizRepository: QuizRepository,
  idCours: number,
  nbPagesCours: number,
  apresPageInitial: number,
  onCree: (quiz: Quiz) => void,
) {
  const [titre, setTitre] = useState('')
  const [dureeDefautSecondes, setDureeDefautSecondes] = useState(30)
  const [apresPage, setApresPage] = useState(apresPageInitial)
  const [questions, setQuestions] = useState<Question[]>([])
  const [erreurs, setErreurs] = useState<ErreursFormulaireQuiz>(ERREURS_VIDES)
  const [etat, setEtat] = useState<AsyncState<Quiz>>({ status: 'idle' })

  function ajouterQuestionQcm() {
    setQuestions((precedent) => [...precedent, nouvelleQuestionQcm(dureeDefautSecondes)])
  }

  function ajouterQuestionLibre() {
    setQuestions((precedent) => [...precedent, nouvelleQuestionLibre(dureeDefautSecondes)])
  }

  function modifierQuestion(id: string, question: Question) {
    setQuestions((precedent) => precedent.map((uneQuestion) => (uneQuestion.id === id ? question : uneQuestion)))
  }

  function supprimerQuestion(id: string) {
    setQuestions((precedent) => precedent.filter((question) => question.id !== id))
  }

  function deplacerQuestion(index: number, direction: -1 | 1) {
    setQuestions((precedent) => {
      const cible = index + direction
      if (cible < 0 || cible >= precedent.length) {
        return precedent
      }
      const copie = [...precedent]
      const [element] = copie.splice(index, 1)
      copie.splice(cible, 0, element)
      return copie
    })
  }

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()

    const nouveauQuiz: NouveauQuiz = { titre, dureeDefautSecondes, apresPage, questions }
    const erreursValidation = validerQuiz(nouveauQuiz, nbPagesCours)
    setErreurs(erreursValidation)
    if (!formulaireValide(erreursValidation)) {
      return
    }

    setEtat({ status: 'loading' })
    try {
      const quiz = await quizRepository.creerQuiz(idCours, nouveauQuiz)
      setEtat({ status: 'success', data: quiz })
      onCree(quiz)
    } catch (erreur) {
      const appError =
        erreur instanceof AppError ? erreur : new AppError('ERREUR_INCONNUE', 'Une erreur inattendue est survenue. Réessayez.')
      setEtat({ status: 'error', error: appError })
    }
  }

  return {
    titre,
    setTitre,
    dureeDefautSecondes,
    setDureeDefautSecondes,
    apresPage,
    setApresPage,
    questions,
    ajouterQuestionQcm,
    ajouterQuestionLibre,
    modifierQuestion,
    supprimerQuestion,
    deplacerQuestion,
    erreurs,
    etat,
    soumettre,
  }
}
