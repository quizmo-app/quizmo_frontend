/**
 * Erreurs métier partagées (shared kernel).
 * Indépendantes du transport : l'infrastructure traduit les statuts HTTP
 * (400, 401, 403, 404, 413, 415, 422, 5xx, coupure réseau) vers ces codes.
 */
export type AppErrorCode =
  | 'UNAUTHENTICATED' // 401 : JWT absent ou expiré → redirection CU1.1
  | 'FORBIDDEN' // 403 : cours d'un autre enseignant
  | 'NOT_FOUND' // 404 : cours introuvable
  | 'COURSE_ARCHIVED' // contrôle « cours non archivé »
  | 'PDF_UNAVAILABLE' // contrôle « PDF disponible »
  | 'MISSING_TITLE' // 400 (CU1.2) : titre de cours manquant
  | 'FILE_TOO_LARGE' // 413 (CU1.2) : PDF > 50 Mo
  | 'INVALID_FORMAT' // 415 (CU1.2) : fichier absent ou pas un PDF
  | 'UNREADABLE_PDF' // 422 (CU1.2) : PDF illisible ou chiffré
  | 'SERVER_UNAVAILABLE' // 503 (CU1.2/CU1.3) : base de données indisponible
  | 'FIELD_REQUIRED' // 400 (CU1.3) : champ obligatoire vide (titre de quiz, énoncé…)
  | 'QUIZ_NO_QUESTION' // 400 (CU1.3) : quiz sans aucune question
  | 'DURATION_INVALID' // 400 (CU1.3) : durée de question absente ou hors bornes
  | 'MCQ_OPTION_COUNT_INVALID' // 400 (CU1.3) : QCM à moins de 2 ou plus de 8 options
  | 'MCQ_NO_CORRECT_ANSWER' // 400 (CU1.3) : QCM sans aucune bonne réponse
  | 'MCQ_MULTIPLE_WITHOUT_FLAG' // 400 (CU1.3) : plusieurs bonnes réponses sans choix multiple
  | 'OPEN_ANSWER_REQUIRED' // 400 (CU1.3) : question notée sans réponse acceptée
  | 'POSITION_INVALID' // 400 (CU1.3/CU1.4) : position d'insertion hors du cours
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
  MISSING_TITLE: 'Veuillez saisir le titre du cours.',
  FILE_TOO_LARGE:
    'Le fichier dépasse la taille maximale autorisée (50 Mo). Choisissez un PDF plus léger (compression, découpage).',
  INVALID_FORMAT: 'Le fichier doit être au format PDF.',
  UNREADABLE_PDF: 'Le PDF est illisible ou protégé. Fournissez un PDF non protégé, réexporté depuis la source.',
  SERVER_UNAVAILABLE: 'Réessayez dans quelques minutes ou prévenez l’administrateur.',
  FIELD_REQUIRED: 'Ce champ est obligatoire.',
  QUIZ_NO_QUESTION: 'Un quiz doit contenir au moins une question.',
  DURATION_INVALID: 'La durée doit être un nombre entier valide.',
  MCQ_OPTION_COUNT_INVALID: 'Un QCM doit avoir entre 2 et 8 options.',
  MCQ_NO_CORRECT_ANSWER: 'Un QCM doit avoir au moins une bonne réponse.',
  MCQ_MULTIPLE_WITHOUT_FLAG: 'Une seule bonne réponse sans choix multiple.',
  OPEN_ANSWER_REQUIRED: 'Une question notée doit avoir au moins une réponse acceptée.',
  POSITION_INVALID: 'La position choisie est hors du cours.',
  NETWORK: 'La connexion au serveur est interrompue. Vérifiez votre réseau, puis reprenez la présentation.',
  UNKNOWN: 'Le serveur ne répond pas comme prévu. Réessayez dans quelques instants.',
}
