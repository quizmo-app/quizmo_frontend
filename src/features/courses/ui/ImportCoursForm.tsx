import { Button } from '../../../shared/ui/Button'
import { useImportCours } from '../application/useImportCours'
import type { Cours } from '../domain/Cours'
import type { CoursRepository } from '../domain/CoursRepository'

interface ImportCoursFormProps {
  coursRepository: CoursRepository
  onImporte: (cours: Cours) => void
  onAnnuler: () => void
}

export function ImportCoursForm({ coursRepository, onImporte, onAnnuler }: ImportCoursFormProps) {
  const { titre, setTitre, setFichier, etat, soumettre } = useImportCours(coursRepository, onImporte)
  const envoiEnCours = etat.status === 'loading'

  return (
    <form className="import-cours-form" onSubmit={soumettre}>
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

      {etat.status === 'error' && (
        <p role="alert" className="import-cours-form__erreur">
          {etat.error.message}
        </p>
      )}

      <div className="import-cours-form__actions">
        <Button type="button" variante="secondary" onClick={onAnnuler} disabled={envoiEnCours}>
          Annuler
        </Button>
        <Button type="submit" variante="primary" disabled={envoiEnCours}>
          {envoiEnCours ? 'Envoi en cours…' : 'Envoyer'}
        </Button>
      </div>
    </form>
  )
}
