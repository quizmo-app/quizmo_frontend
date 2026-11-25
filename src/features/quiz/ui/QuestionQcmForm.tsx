import { Button } from '../../../shared/ui/Button'
import type { OptionQcm, QuestionQcm } from '../domain/Quiz'

interface QuestionQcmFormProps {
  question: QuestionQcm
  index: number
  erreurs: string[]
  onChange: (question: QuestionQcm) => void
  onSupprimer: () => void
  onMonter: () => void
  onDescendre: () => void
}

export function QuestionQcmForm({ question, index, erreurs, onChange, onSupprimer, onMonter, onDescendre }: QuestionQcmFormProps) {
  function modifierOption(idOption: string, champs: Partial<OptionQcm>) {
    onChange({ ...question, options: question.options.map((option) => (option.id === idOption ? { ...option, ...champs } : option)) })
  }

  function cocherCorrecte(idOption: string, correcte: boolean) {
    if (question.choixMultiple) {
      modifierOption(idOption, { correcte })
    } else {
      onChange({
        ...question,
        options: question.options.map((option) => ({ ...option, correcte: option.id === idOption ? correcte : false })),
      })
    }
  }

  function ajouterOption() {
    if (question.options.length >= 8) return
    onChange({ ...question, options: [...question.options, { id: crypto.randomUUID(), libelle: '', correcte: false }] })
  }

  function supprimerOption(idOption: string) {
    if (question.options.length <= 2) return
    onChange({ ...question, options: question.options.filter((option) => option.id !== idOption) })
  }

  return (
    <fieldset className={`question-editeur${erreurs.length > 0 ? ' question-editeur--invalide' : ''}`}>
      <div className="question-editeur__entete">
        <legend>Question {index + 1} · QCM</legend>
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
          checked={question.choixMultiple}
          onChange={(evenement) => onChange({ ...question, choixMultiple: evenement.target.checked })}
        />
        Choix multiple
      </label>

      {question.options.map((option) => (
        <div key={option.id} className="question-editeur__option">
          <input
            type={question.choixMultiple ? 'checkbox' : 'radio'}
            name={`bonne-reponse-${question.id}`}
            checked={option.correcte}
            onChange={(evenement) => cocherCorrecte(option.id, evenement.target.checked)}
          />
          <input
            value={option.libelle}
            onChange={(evenement) => modifierOption(option.id, { libelle: evenement.target.value })}
            placeholder="Libellé de la réponse"
          />
          <Button type="button" variante="secondary" onClick={() => supprimerOption(option.id)} disabled={question.options.length <= 2}>
            Retirer
          </Button>
        </div>
      ))}

      <Button type="button" variante="secondary" onClick={ajouterOption} disabled={question.options.length >= 8}>
        Ajouter une option
      </Button>

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
