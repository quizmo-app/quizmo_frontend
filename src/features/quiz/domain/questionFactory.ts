import type { QuestionLibre, QuestionQcm } from './Quiz'

export function nouvelleQuestionQcm(dureeDefautSecondes: number): QuestionQcm {
  return {
    id: crypto.randomUUID(),
    type: 'QCM',
    enonce: '',
    dureeSecondes: dureeDefautSecondes,
    choixMultiple: false,
    options: [
      { id: crypto.randomUUID(), libelle: '', correcte: false },
      { id: crypto.randomUUID(), libelle: '', correcte: false },
    ],
  }
}

export function nouvelleQuestionLibre(dureeDefautSecondes: number): QuestionLibre {
  return {
    id: crypto.randomUUID(),
    type: 'LIBRE',
    enonce: '',
    dureeSecondes: dureeDefautSecondes,
    notee: true,
    reponsesAcceptees: [''],
  }
}
