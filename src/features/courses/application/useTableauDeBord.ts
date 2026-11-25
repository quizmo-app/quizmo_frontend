import { useState } from 'react'
import type { Cours } from '../domain/Cours'

type Vue = { type: 'liste' } | { type: 'import' } | { type: 'detail'; cours: Cours }

export function useTableauDeBord() {
  const [cours, setCours] = useState<Cours[]>([])
  const [vue, setVue] = useState<Vue>({ type: 'liste' })

  function ouvrirImport() {
    setVue({ type: 'import' })
  }

  function ouvrirCours(unCours: Cours) {
    setVue({ type: 'detail', cours: unCours })
  }

  function retourListe() {
    setVue({ type: 'liste' })
  }

  function gererImport(nouveauCours: Cours) {
    setCours((precedent) => [...precedent, nouveauCours])
    setVue({ type: 'liste' })
  }

  function gererQuizCree(idCours: number) {
    setCours((precedent) => precedent.map((unCours) => (unCours.idCours === idCours ? { ...unCours, nbQuiz: unCours.nbQuiz + 1 } : unCours)))
    setVue((precedente) =>
      precedente.type === 'detail' && precedente.cours.idCours === idCours
        ? { type: 'detail', cours: { ...precedente.cours, nbQuiz: precedente.cours.nbQuiz + 1 } }
        : precedente,
    )
  }

  return { vue, cours, ouvrirImport, ouvrirCours, retourListe, gererImport, gererQuizCree }
}
