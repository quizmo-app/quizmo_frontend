import { Button } from '../../../shared/ui/Button'
import { useInsererQuiz } from '../application/useInsererQuiz'
import type { Insertion } from '../domain/Insertion'
import type { InsertionRepository } from '../domain/InsertionRepository'
import './insertion.css'

interface InsererQuizFormProps {
  insertionRepository: InsertionRepository
  idCours: number
  idVersion: number
  nbPagesCours: number
  onInsere: (insertion: Insertion) => void
}

export function InsererQuizForm({ insertionRepository, idCours, idVersion, nbPagesCours, onInsere }: InsererQuizFormProps) {
  const { idQuiz, setIdQuiz, apresPage, setApresPage, erreurIdQuiz, erreurPage, etat, soumettre } = useInsererQuiz(
    insertionRepository,
    idCours,
    idVersion,
    nbPagesCours,
    onInsere,
  )
  const envoiEnCours = etat.status === 'loading'

  return (
    <form className="inserer-quiz-form" onSubmit={soumettre}>
      <h3>Insérer un quiz existant</h3>

      <label htmlFor="id-quiz">Identifiant du quiz</label>
      <input
        id="id-quiz"
        type="number"
        min={1}
        value={idQuiz ?? ''}
        onChange={(evenement) => setIdQuiz(evenement.target.value === '' ? null : Number(evenement.target.value))}
        disabled={envoiEnCours}
      />
      {erreurIdQuiz && (
        <p role="alert" className="import-cours-form__erreur">
          {erreurIdQuiz}
        </p>
      )}

      <label htmlFor="apres-page-insertion">Après la page</label>
      <input
        id="apres-page-insertion"
        type="number"
        min={0}
        max={nbPagesCours}
        value={apresPage}
        onChange={(evenement) => setApresPage(Number(evenement.target.value))}
        disabled={envoiEnCours}
      />
      {erreurPage && (
        <p role="alert" className="import-cours-form__erreur">
          {erreurPage}
        </p>
      )}

      {etat.status === 'error' && (
        <p role="alert" className="import-cours-form__erreur">
          {etat.error.message}
        </p>
      )}
      {etat.status === 'success' && (
        <p className="inserer-quiz-form__succes">
          Quiz {etat.data.idQuiz} inséré après la page {etat.data.apresPage} (ordre {etat.data.ordre}).
        </p>
      )}

      <div className="import-cours-form__actions">
        <Button type="submit" variante="primary" disabled={envoiEnCours}>
          {envoiEnCours ? 'Insertion…' : 'Insérer'}
        </Button>
      </div>
    </form>
  )
}
