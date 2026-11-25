import type { NouveauQuiz, Question, QuestionLibre, QuestionQcm } from './Quiz'

// Bornes de durée non encore fixées par le client (réserve du cahier de recette QM-12) : valeurs provisoires.
export const DUREE_MIN_SECONDES = 5
export const DUREE_MAX_SECONDES = 300

export function validerTitreQuiz(titre: string): string | null {
  if (titre.trim().length === 0) {
    return 'Ce champ est obligatoire.'
  }
  return null
}

export function validerPosition(apresPage: number, nbPagesCours: number): string | null {
  if (!Number.isInteger(apresPage) || apresPage < 0 || apresPage > nbPagesCours) {
    return `La position doit être un nombre entier entre 0 et ${nbPagesCours}.`
  }
  return null
}

export function validerDuree(dureeSecondes: number): string | null {
  if (!Number.isInteger(dureeSecondes) || dureeSecondes < DUREE_MIN_SECONDES || dureeSecondes > DUREE_MAX_SECONDES) {
    return `La durée doit être un nombre entier entre ${DUREE_MIN_SECONDES} et ${DUREE_MAX_SECONDES} secondes.`
  }
  return null
}

export function validerQuestionQcm(question: QuestionQcm): string[] {
  const erreurs: string[] = []

  if (question.enonce.trim().length === 0) {
    erreurs.push('Ce champ est obligatoire.')
  }

  const erreurDuree = validerDuree(question.dureeSecondes)
  if (erreurDuree) {
    erreurs.push(erreurDuree)
  }

  if (question.options.length < 2 || question.options.length > 8) {
    erreurs.push('Un QCM doit avoir entre 2 et 8 options.')
  }

  if (question.options.some((option) => option.libelle.trim().length === 0)) {
    erreurs.push('Chaque option doit être renseignée.')
  }

  const nbBonnesReponses = question.options.filter((option) => option.correcte).length
  if (nbBonnesReponses === 0) {
    erreurs.push('Un QCM doit avoir au moins une bonne réponse.')
  } else if (!question.choixMultiple && nbBonnesReponses > 1) {
    erreurs.push('Une seule bonne réponse sans choix multiple.')
  }

  return erreurs
}

export function validerQuestionLibre(question: QuestionLibre): string[] {
  const erreurs: string[] = []

  if (question.enonce.trim().length === 0) {
    erreurs.push('Ce champ est obligatoire.')
  }

  const erreurDuree = validerDuree(question.dureeSecondes)
  if (erreurDuree) {
    erreurs.push(erreurDuree)
  }

  if (question.notee && question.reponsesAcceptees.every((reponse) => reponse.trim().length === 0)) {
    erreurs.push('Une question notée doit avoir au moins une réponse acceptée.')
  }

  return erreurs
}

export function validerQuestion(question: Question): string[] {
  return question.type === 'QCM' ? validerQuestionQcm(question) : validerQuestionLibre(question)
}

export interface ErreursFormulaireQuiz {
  titre: string | null
  position: string | null
  quiz: string | null
  parQuestion: Record<string, string[]>
}

export function validerQuiz(nouveauQuiz: NouveauQuiz, nbPagesCours: number): ErreursFormulaireQuiz {
  const parQuestion: Record<string, string[]> = {}
  for (const question of nouveauQuiz.questions) {
    const erreurs = validerQuestion(question)
    if (erreurs.length > 0) {
      parQuestion[question.id] = erreurs
    }
  }

  return {
    titre: validerTitreQuiz(nouveauQuiz.titre),
    position: validerPosition(nouveauQuiz.apresPage, nbPagesCours),
    quiz: nouveauQuiz.questions.length === 0 ? 'Un quiz doit contenir au moins une question.' : null,
    parQuestion,
  }
}

export function formulaireValide(erreurs: ErreursFormulaireQuiz): boolean {
  return !erreurs.titre && !erreurs.position && !erreurs.quiz && Object.keys(erreurs.parQuestion).length === 0
}
