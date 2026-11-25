import { Button } from '../../../shared/ui/Button'
import type { QuestionLibre } from '../domain/Quiz'

interface QuestionLibreFormProps {
  question: QuestionLibre
  index: number
  erreurs: string[]
  onChange: (question: QuestionLibre) => void
  onSupprimer: () => void
  onMonter: () => void
  onDescendre: () => void
}

export function QuestionLibreForm({ question, index, erreurs, onChange, onSupprimer, onMonter, onDescendre }: QuestionLibreFormProps) {
  function modifierReponse(indexReponse: number, valeur: string) {
    onChange({
      ...question,
      reponsesAcceptees: question.reponsesAcceptees.map((reponse, i) => (i === indexReponse ? valeur : reponse)),
    })
  }

  function ajouterReponse() {
    onChange({ ...question, reponsesAcceptees: [...question.reponsesAcceptees, ''] })
  }

  function supprimerReponse(indexReponse: number) {
    onChange({ ...question, reponsesAcceptees: question.reponsesAcceptees.filter((_, i) => i !== indexReponse) })
  }

  return (
    <fieldset className={`question-editeur${erreurs.length > 0 ? ' question-editeur--invalide' : ''}`}>
      <div className="question-editeur__entete">
        <legend>Question {index + 1} · Réponse libre</legend>
        <div className="question-editeur__actions">
          <Button type="button" variante="secondary" onClick={onMonter}>
            ↑
          </Button>
          <Button type="button" variante="secondary" onClick={onDescendre}>
            ↓
          </Button>
          <Button type="button" variante="secondary" onClick={onSupprimer}>
            Retirer la question
          </Button>
        </div>
      </div>

      <label>Énoncé</label>
      <input value={question.enonce} onChange={(evenement) => onChange({ ...question, enonce: evenement.target.value })} />

      <label>Durée (secondes)</label>
      <input
        type="number"
        value={question.dureeSecondes}
        onChange={(evenement) => onChange({ ...question, dureeSecondes: Number(evenement.target.value) })}
      />

      <label className="question-editeur__case">
        <input
          type="checkbox"
          checked={question.notee}
          onChange={(evenement) => onChange({ ...question, notee: evenement.target.checked })}
        />
        Notée
      </label>

      {question.notee && (
        <>
          <label>Réponses acceptées</label>
          {question.reponsesAcceptees.map((reponse, i) => (
            <div key={i} className="question-editeur__option">
              <input value={reponse} onChange={(evenement) => modifierReponse(i, evenement.target.value)} />
              <Button type="button" variante="secondary" onClick={() => supprimerReponse(i)} disabled={question.reponsesAcceptees.length <= 1}>
                Retirer
              </Button>
            </div>
          ))}
          <Button type="button" variante="secondary" onClick={ajouterReponse}>
            Ajouter une réponse acceptée
          </Button>
        </>
      )}

      {erreurs.length > 0 && (
        <ul className="question-editeur__erreurs" role="alert">
          {erreurs.map((erreur) => (
            <li key={erreur}>{erreur}</li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}
