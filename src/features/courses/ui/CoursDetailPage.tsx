import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import type { InsertionRepository } from '../../insertion/domain/InsertionRepository'
import { InsererQuizForm } from '../../insertion/ui/InsererQuizForm'
import type { QuizRepository } from '../../quiz/domain/QuizRepository'
import { CreerQuizForm } from '../../quiz/ui/CreerQuizForm'
import type { Cours } from '../domain/Cours'

interface CoursDetailPageProps {
  cours: Cours
  quizRepository: QuizRepository
  insertionRepository: InsertionRepository
  onQuizCree: (idCours: number) => void
  onRetour: () => void
}

export function CoursDetailPage({ cours, quizRepository, insertionRepository, onQuizCree, onRetour }: CoursDetailPageProps) {
  const [formulaireQuizOuvert, setFormulaireQuizOuvert] = useState(false)
  const [formulaireInsertionOuvert, setFormulaireInsertionOuvert] = useState(false)
  const [apresPage, setApresPage] = useState(0)

  if (formulaireQuizOuvert) {
    return (
      <CreerQuizForm
        quizRepository={quizRepository}
        idCours={cours.idCours}
        nbPagesCours={cours.nbPages}
        apresPageInitial={apresPage}
        onCree={() => {
          onQuizCree(cours.idCours)
          setFormulaireQuizOuvert(false)
        }}
        onAnnuler={() => setFormulaireQuizOuvert(false)}
      />
    )
  }

  return (
    <section className="cours-detail">
      <Button type="button" variante="secondary" onClick={onRetour}>
        ← Retour au tableau de bord
      </Button>

      <h2>{cours.titre}</h2>
      <p className="cours-detail__meta">
        Version {cours.versionCourante} · {cours.nbPages} pages · {cours.nbQuiz} quiz
      </p>

      <p className="cours-detail__a-venir">
        L'éditeur complet (miniatures des pages, aperçu des emplacements) arrive avec la fonctionnalité Consulter et gérer ses cours.
      </p>

      <div className="cours-detail__inserer-quiz">
        <label htmlFor="apres-page-quiz">Insérer un quiz après la page</label>
        <input
          id="apres-page-quiz"
          type="number"
          min={0}
          max={cours.nbPages}
          value={apresPage}
          onChange={(evenement) => setApresPage(Number(evenement.target.value))}
        />
        <Button type="button" variante="primary" onClick={() => setFormulaireQuizOuvert(true)}>
          Insérer un quiz
        </Button>
      </div>

      {formulaireInsertionOuvert ? (
        <>
          <InsererQuizForm
            insertionRepository={insertionRepository}
            idCours={cours.idCours}
            idVersion={cours.idVersion}
            nbPagesCours={cours.nbPages}
            onInsere={() => {}}
          />
          <Button type="button" variante="secondary" onClick={() => setFormulaireInsertionOuvert(false)}>
            Fermer
          </Button>
        </>
      ) : (
        <Button type="button" variante="secondary" onClick={() => setFormulaireInsertionOuvert(true)}>
          Insérer un quiz existant
        </Button>
      )}
    </section>
  )
}
