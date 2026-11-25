import type { Cours } from '../domain/Cours'

interface CoursListProps {
  cours: Cours[]
  onOuvrir: (cours: Cours) => void
}

export function CoursList({ cours, onOuvrir }: CoursListProps) {
  if (cours.length === 0) {
    return <p>Aucun cours importé pour le moment.</p>
  }

  return (
    <ul className="cours-list">
      {cours.map((unCours) => (
        <li key={unCours.idCours} className="cours-list__item">
          <button type="button" className="cours-list__ouvrir" onClick={() => onOuvrir(unCours)}>
            <span className="cours-list__titre">{unCours.titre}</span>
            <span className="cours-list__meta">
              Version {unCours.versionCourante} · {unCours.nbPages} pages · {unCours.nbQuiz} quiz
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
