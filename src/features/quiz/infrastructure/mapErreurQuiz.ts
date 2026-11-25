import { ApiError } from '../../../shared/errors/ApiError'
import { AppError } from '../../../shared/errors/AppError'

const MESSAGE_PAR_CODE: Record<string, string> = {
  QUIZ_SANS_QUESTION: 'Un quiz doit contenir au moins une question.',
  CHAMP_OBLIGATOIRE: 'Ce champ est obligatoire.',
  DUREE_INVALIDE: 'La durée est invalide.',
  POSITION_INVALIDE: 'La position choisie est hors du cours.',
  QCM_AUCUNE_BONNE_REPONSE: 'Un QCM doit avoir au moins une bonne réponse.',
  QCM_NB_OPTIONS_INVALIDE: 'Un QCM doit avoir entre 2 et 8 options.',
}

const MESSAGE_PAR_STATUT: Record<number, string> = {
  401: 'Vous devez être connecté pour effectuer cette action.',
  403: "Vous n'avez pas accès à ce cours.",
  404: "Ce cours n'existe plus.",
  500: 'Réessayez dans quelques minutes ou prévenez l’administrateur.',
}

const CODE_PAR_STATUT: Record<number, string> = {
  401: 'NON_AUTHENTIFIE',
  403: 'ACCES_REFUSE',
  404: 'COURS_INTROUVABLE',
  500: 'ERREUR_SERVEUR',
}

interface DetailErreur {
  code: string
  field?: string
  message?: string
}

export function mapErreurQuiz(erreur: unknown): AppError {
  if (erreur instanceof ApiError) {
    if (erreur.status === 400) {
      const corps = erreur.body as { details?: DetailErreur[] } | null
      const details = corps?.details ?? []
      const message =
        details.length > 0
          ? details.map((detail) => detail.message ?? MESSAGE_PAR_CODE[detail.code] ?? detail.code).join(' ')
          : 'La saisie contient des erreurs. Corrigez-les puis réessayez.'
      return new AppError('VALIDATION_SERVEUR', message)
    }

    const code = CODE_PAR_STATUT[erreur.status] ?? 'ERREUR_INCONNUE'
    const corpsErreur = erreur.body as { message?: string } | null
    return new AppError(code, corpsErreur?.message ?? MESSAGE_PAR_STATUT[erreur.status] ?? 'Une erreur inattendue est survenue. Réessayez.')
  }

  return new AppError('ERREUR_INCONNUE', 'Une erreur inattendue est survenue. Réessayez.')
}
