import { ApiError } from '../../../shared/errors/ApiError'
import { AppError } from '../../../shared/errors/AppError'

const MESSAGE_PAR_CODE: Record<string, string> = {
  PAGE_INVALIDE: 'La page choisie est hors du cours.',
  QUIZ_INVALIDE:
    "Ce quiz n'a pas de question, ou n'appartient pas à ce cours. Choisissez un autre quiz ou ajoutez-lui une question.",
  SESSION_EXPIREE: 'Votre session a expiré. Reconnectez-vous puis réessayez.',
  ACCES_REFUSE: "Vous n'avez pas accès à ce cours.",
  RESSOURCE_INTROUVABLE: 'Ce cours, cette version ou ce quiz est introuvable.',
  VERSION_NON_COURANTE: 'Seule la version courante du cours accepte de nouvelles insertions.',
  QUIZ_DEJA_INSERE: 'Ce quiz est déjà inséré dans cette version. Déplacez l’insertion existante ou choisissez un autre quiz.',
  BDD_INDISPONIBLE: 'Réessayez dans quelques minutes ou prévenez l’administrateur.',
  ERREUR_INCONNUE: 'Une erreur inattendue est survenue. Réessayez.',
}

// Le statut 409 recouvre deux codes distincts (VERSION_NON_COURANTE, QUIZ_DEJA_INSERE) : on retient le code du
// corps de réponse quand il est présent, ce tableau ne sert que de repli si le serveur ne l'envoie pas.
const CODE_PAR_STATUT: Record<number, string> = {
  400: 'PAGE_INVALIDE',
  401: 'SESSION_EXPIREE',
  403: 'ACCES_REFUSE',
  404: 'RESSOURCE_INTROUVABLE',
  409: 'QUIZ_DEJA_INSERE',
  422: 'QUIZ_INVALIDE',
  503: 'BDD_INDISPONIBLE',
}

interface CorpsErreur {
  code?: string
  message?: string
}

export function mapErreurInsertion(erreur: unknown): AppError {
  if (erreur instanceof ApiError) {
    const corps = erreur.body as CorpsErreur | null
    const code = corps?.code ?? CODE_PAR_STATUT[erreur.status] ?? 'ERREUR_INCONNUE'
    return new AppError(code, corps?.message ?? MESSAGE_PAR_CODE[code] ?? MESSAGE_PAR_CODE.ERREUR_INCONNUE)
  }
  return new AppError('ERREUR_INCONNUE', MESSAGE_PAR_CODE.ERREUR_INCONNUE)
}
