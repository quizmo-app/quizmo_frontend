export function validerPage(apresPage: number, nbPagesCours: number): string | null {
  if (!Number.isInteger(apresPage) || apresPage < 0 || apresPage > nbPagesCours) {
    return `La page doit être un nombre entier entre 0 et ${nbPagesCours}.`
  }
  return null
}

export function validerIdQuiz(idQuiz: number | null): string | null {
  if (idQuiz === null || !Number.isInteger(idQuiz) || idQuiz <= 0) {
    return 'Choisissez un quiz à insérer.'
  }
  return null
}
