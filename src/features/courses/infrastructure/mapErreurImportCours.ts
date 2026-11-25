import { ApiError } from '../../../shared/errors/ApiError'
import { AppError } from '../../../shared/errors/AppError'

const MESSAGE_PAR_DEFAUT = {
  TITRE_MANQUANT: 'Veuillez saisir le titre du cours.',
  FICHIER_TROP_VOLUMINEUX:
    'Le fichier dépasse la taille maximale autorisée (50 Mo). Choisissez un PDF plus léger (compression, découpage).',
  FORMAT_NON_PDF: 'Le fichier doit être au format PDF.',
  PDF_ILLISIBLE: 'Le PDF est illisible ou protégé. Fournissez un PDF non protégé, réexporté depuis la source.',
  NON_AUTHENTIFIE: 'Vous devez être connecté pour effectuer cette action.',
  BDD_INDISPONIBLE: 'Réessayez dans quelques minutes ou prévenez l’administrateur.',
  ERREUR_INCONNUE: 'Une erreur inattendue est survenue. Réessayez.',
} as const

type CodeErreurImportCours = keyof typeof MESSAGE_PAR_DEFAUT

const CODE_PAR_STATUT: Record<number, CodeErreurImportCours> = {
  400: 'TITRE_MANQUANT',
  401: 'NON_AUTHENTIFIE',
  413: 'FICHIER_TROP_VOLUMINEUX',
  415: 'FORMAT_NON_PDF',
  422: 'PDF_ILLISIBLE',
  503: 'BDD_INDISPONIBLE',
}

export function mapErreurImportCours(erreur: unknown): AppError {
  if (erreur instanceof ApiError) {
    const code = CODE_PAR_STATUT[erreur.status] ?? 'ERREUR_INCONNUE'
    const corps = erreur.body as { message?: string } | null
    return new AppError(code, corps?.message ?? MESSAGE_PAR_DEFAUT[code])
  }
  return new AppError('ERREUR_INCONNUE', MESSAGE_PAR_DEFAUT.ERREUR_INCONNUE)
}
