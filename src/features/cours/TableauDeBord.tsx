import { useState } from 'react'
import type { Cours } from '../../types/cours'
import { CoursList } from './CoursList'
import { ImportCoursForm } from './ImportCoursForm'

export function TableauDeBord() {
  const [cours, setCours] = useState<Cours[]>([])
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  function gererImport(nouveauCours: Cours) {
    setCours((precedent) => [...precedent, nouveauCours])
    setFormulaireOuvert(false)
  }

  return (
    <section className="tableau-de-bord">
      <header className="tableau-de-bord__entete">
        <h1>Mes cours</h1>
        {!formulaireOuvert && (
          <button type="button" onClick={() => setFormulaireOuvert(true)}>
            Importer un cours
          </button>
        )}
      </header>

      {formulaireOuvert ? (
        <ImportCoursForm onImporte={gererImport} onAnnuler={() => setFormulaireOuvert(false)} />
      ) : (
        <CoursList cours={cours} />
      )}
    </section>
  )
}
