/**
 * Erreurs métier partagées (shared kernel).
 * Indépendantes du transport : l'infrastructure traduit les statuts HTTP
 * (401, 403, 404, 409, 5xx, coupure réseau) vers ces codes.
 */
export type AppErrorCode =
  | 'UNAUTHENTICATED' // 401 : JWT absent ou expiré → redirection CU1.1
  | 'FORBIDDEN' // 403 : cours d'un autre enseignant
  | 'NOT_FOUND' // 404 : cours introuvable
  | 'COURSE_ARCHIVED' // contrôle « cours non archivé »
  | 'PDF_UNAVAILABLE' // contrôle « PDF disponible »
  | 'NETWORK' // coupure réseau → état « Interrompue »
  | 'UNKNOWN'

export class AppError extends Error {
  readonly code: AppErrorCode

  constructor(code: AppErrorCode, message?: string) {
    super(message ?? defaultMessages[code])
    this.name = 'AppError'
    this.code = code
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) return error
    // Le détail technique reste en console : l'enseignant voit un message actionnable.
    console.error(error)
    return new AppError('UNKNOWN')
  }
}

/**
 * Messages affichés à l'enseignant (charte : vouvoiement, dire quoi faire, sans s'excuser,
 * nommer les choses comme l'enseignant les voit).
 */
export const defaultMessages: Record<AppErrorCode, string> = {
  UNAUTHENTICATED: 'Votre session a expiré. Reconnectez-vous pour continuer.',
  FORBIDDEN: "Ce cours appartient à un autre enseignant. Choisissez l'un de vos cours dans le tableau de bord.",
  NOT_FOUND: 'Ce cours est introuvable. Vérifiez le lien ou choisissez un cours dans le tableau de bord.',
  COURSE_ARCHIVED: 'Ce cours est archivé. Choisissez un cours non archivé pour lancer la présentation.',
  PDF_UNAVAILABLE: "Le PDF de ce cours n'est pas encore disponible. Réessayez dans quelques instants ou importez-le de nouveau.",
  NETWORK: 'La connexion au serveur est interrompue. Vérifiez votre réseau, puis reprenez la présentation.',
  UNKNOWN: 'Le serveur ne répond pas comme prévu. Réessayez dans quelques instants.',
}
