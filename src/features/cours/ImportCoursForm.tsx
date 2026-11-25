import { useState } from 'react'
import type { FormEvent } from 'react'
import { importerCours } from '../../api/coursApi'
import { ApiError } from '../../api/http'
import type { Cours } from '../../types/cours'
import { validerFichier, validerTitre } from './validation'

interface ImportCoursFormProps {
  onImporte: (cours: Cours) => void
  onAnnuler: () => void
}

export function ImportCoursForm({ onImporte, onAnnuler }: ImportCoursFormProps) {
  const [titre, setTitre] = useState('')
  const [fichier, setFichier] = useState<File | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()

    const erreurTitre = validerTitre(titre)
    const erreurFichier = validerFichier(fichier)
    if (erreurTitre) {
      setErreur(erreurTitre)
      return
    }
    if (erreurFichier) {
      setErreur(erreurFichier)
      return
    }

    setErreur(null)
    setEnvoiEnCours(true)
    try {
      const cours = await importerCours(titre.trim(), fichier!)
      onImporte(cours)
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue. Réessayez.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <form className="import-cours-form" onSubmit={gererEnvoi}>
      <h2>Importer un cours</h2>

      <label htmlFor="titre-cours">Titre du cours</label>
      <input
        id="titre-cours"
        type="text"
        value={titre}
        onChange={(evenement) => setTitre(evenement.target.value)}
        disabled={envoiEnCours}
        autoFocus
      />

      <label htmlFor="fichier-cours">Support de cours (PDF, 50 Mo maximum)</label>
      <input
        id="fichier-cours"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(evenement) => setFichier(evenement.target.files?.[0] ?? null)}
        disabled={envoiEnCours}
      />

      {erreur && (
        <p role="alert" className="import-cours-form__erreur">
          {erreur}
        </p>
      )}

      <div className="import-cours-form__actions">
        <button type="button" className="btn--secondary" onClick={onAnnuler} disabled={envoiEnCours}>
          Annuler
        </button>
        <button type="submit" className="btn--primary" disabled={envoiEnCours}>
          {envoiEnCours ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </div>
    </form>
  )
}
