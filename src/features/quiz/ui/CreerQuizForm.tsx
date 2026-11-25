import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { useCreerQuiz } from '../application/useCreerQuiz'
import type { Quiz } from '../domain/Quiz'
import type { QuizRepository } from '../domain/QuizRepository'
import { QuestionLibreForm } from './QuestionLibreForm'
import { QuestionQcmForm } from './QuestionQcmForm'
import './quiz.css'

interface CreerQuizFormProps {
  quizRepository: QuizRepository
  idCours: number
  nbPagesCours: number
  apresPageInitial: number
  onCree: (quiz: Quiz) => void
  onAnnuler: () => void
}

export function CreerQuizForm({ quizRepository, idCours, nbPagesCours, apresPageInitial, onCree, onAnnuler }: CreerQuizFormProps) {
  const {
    titre,
    setTitre,
    dureeDefautSecondes,
    setDureeDefautSecondes,
    apresPage,
    setApresPage,
    questions,
    ajouterQuestionQcm,
    ajouterQuestionLibre,
    modifierQuestion,
    supprimerQuestion,
    deplacerQuestion,
    erreurs,
    etat,
    soumettre,
  } = useCreerQuiz(quizRepository, idCours, nbPagesCours, apresPageInitial, onCree)

  const [confirmationAnnulation, setConfirmationAnnulation] = useState(false)
  const envoiEnCours = etat.status === 'loading'
  const nbQuestionsACorriger = Object.keys(erreurs.parQuestion).length

  function demanderAnnulation() {
    if (titre.trim().length === 0 && questions.length === 0) {
      onAnnuler()
      return
    }
    setConfirmationAnnulation(true)
  }

  return (
    <form className="creer-quiz-form" onSubmit={soumettre}>
      <h2>Insérer un quiz</h2>

      <label htmlFor="titre-quiz">Titre du quiz</label>
      <input id="titre-quiz" value={titre} onChange={(evenement) => setTitre(evenement.target.value)} disabled={envoiEnCours} />
      {erreurs.titre && (
        <p role="alert" className="import-cours-form__erreur">
          {erreurs.titre}
        </p>
      )}

      <label htmlFor="apres-page">Après la page</label>
      <input
        id="apres-page"
        type="number"
        min={0}
        max={nbPagesCours}
        value={apresPage}
        onChange={(evenement) => setApresPage(Number(evenement.target.value))}
        disabled={envoiEnCours}
      />
      {erreurs.position && (
        <p role="alert" className="import-cours-form__erreur">
          {erreurs.position}
        </p>
      )}

      <label htmlFor="duree-defaut">Durée par défaut des questions (secondes)</label>
      <input
        id="duree-defaut"
        type="number"
        value={dureeDefautSecondes}
        onChange={(evenement) => setDureeDefautSecondes(Number(evenement.target.value))}
        disabled={envoiEnCours}
      />

      {erreurs.quiz && (
        <p role="alert" className="import-cours-form__erreur">
          {erreurs.quiz}
        </p>
      )}

      <div className="creer-quiz-form__questions">
        {questions.map((question, index) =>
          question.type === 'QCM' ? (
            <QuestionQcmForm
              key={question.id}
              question={question}
              index={index}
              erreurs={erreurs.parQuestion[question.id] ?? []}
              onChange={(questionModifiee) => modifierQuestion(question.id, questionModifiee)}
              onSupprimer={() => supprimerQuestion(question.id)}
              onMonter={() => deplacerQuestion(index, -1)}
              onDescendre={() => deplacerQuestion(index, 1)}
            />
          ) : (
            <QuestionLibreForm
              key={question.id}
              question={question}
              index={index}
              erreurs={erreurs.parQuestion[question.id] ?? []}
              onChange={(questionModifiee) => modifierQuestion(question.id, questionModifiee)}
              onSupprimer={() => supprimerQuestion(question.id)}
              onMonter={() => deplacerQuestion(index, -1)}
              onDescendre={() => deplacerQuestion(index, 1)}
            />
          ),
        )}
      </div>

      <div className="creer-quiz-form__ajouter">
        <Button type="button" variante="secondary" onClick={ajouterQuestionQcm} disabled={envoiEnCours}>
          + Question QCM
        </Button>
        <Button type="button" variante="secondary" onClick={ajouterQuestionLibre} disabled={envoiEnCours}>
          + Question réponse libre
        </Button>
      </div>

      {etat.status === 'error' && (
        <p role="alert" className="import-cours-form__erreur">
          {etat.error.message}
        </p>
      )}

      <div className="creer-quiz-form__pied">
        {nbQuestionsACorriger > 0 && (
          <span className="creer-quiz-form__compteur-erreurs">
            {nbQuestionsACorriger} question{nbQuestionsACorriger > 1 ? 's' : ''} à corriger
          </span>
        )}

        {confirmationAnnulation ? (
          <div className="creer-quiz-form__confirmation">
            <span>Annuler la saisie ? Rien ne sera enregistré.</span>
            <Button type="button" variante="secondary" onClick={() => setConfirmationAnnulation(false)}>
              Non
            </Button>
            <Button type="button" variante="accent" onClick={onAnnuler}>
              Oui, annuler
            </Button>
          </div>
        ) : (
          <div className="import-cours-form__actions">
            <Button type="button" variante="secondary" onClick={demanderAnnulation} disabled={envoiEnCours}>
              Annuler
            </Button>
            <Button type="submit" variante="primary" disabled={envoiEnCours}>
              {envoiEnCours ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
