export const TAILLE_MAX_OCTETS = 50 * 1024 * 1024

export function validerTitre(titre: string): string | null {
  if (titre.trim().length === 0) {
    return 'Veuillez saisir le titre du cours.'
  }
  return null
}

export function validerFichier(fichier: File | null): string | null {
  if (!fichier) {
    return 'Veuillez choisir un fichier PDF.'
  }
  if (fichier.type !== 'application/pdf' && !fichier.name.toLowerCase().endsWith('.pdf')) {
    return 'Le fichier doit être au format PDF.'
  }
  if (fichier.size > TAILLE_MAX_OCTETS) {
    return 'Le fichier dépasse la taille maximale autorisée (50 Mo). Choisissez un PDF plus léger (compression, découpage).'
  }
  return null
}
