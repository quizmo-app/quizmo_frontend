import { Button } from '../../../shared/ui/Button'
import type { InsertionRepository } from '../../insertion/domain/InsertionRepository'
import type { QuizRepository } from '../../quiz/domain/QuizRepository'
import { useTableauDeBord } from '../application/useTableauDeBord'
import type { CoursRepository } from '../domain/CoursRepository'
import { CoursDetailPage } from './CoursDetailPage'
import { CoursList } from './CoursList'
import { ImportCoursForm } from './ImportCoursForm'
import './courses.css'

interface TableauDeBordPageProps {
  coursRepository: CoursRepository
  quizRepository: QuizRepository
  insertionRepository: InsertionRepository
}

export function TableauDeBordPage({ coursRepository, quizRepository, insertionRepository }: TableauDeBordPageProps) {
  const { vue, cours, ouvrirImport, ouvrirCours, retourListe, gererImport, gererQuizCree } = useTableauDeBord()

  if (vue.type === 'detail') {
    return (
      <CoursDetailPage
        cours={vue.cours}
        quizRepository={quizRepository}
        insertionRepository={insertionRepository}
        onQuizCree={gererQuizCree}
        onRetour={retourListe}
      />
    )
  }

  return (
    <section className="tableau-de-bord">
      <header className="tableau-de-bord__entete">
        <h1>Mes cours</h1>
        {vue.type === 'liste' && (
          <Button type="button" variante="primary" onClick={ouvrirImport}>
            Importer un cours
          </Button>
        )}
      </header>

      {vue.type === 'import' && <ImportCoursForm coursRepository={coursRepository} onImporte={gererImport} onAnnuler={retourListe} />}

      {vue.type === 'liste' && <CoursList cours={cours} onOuvrir={ouvrirCours} />}
    </section>
  )
}
