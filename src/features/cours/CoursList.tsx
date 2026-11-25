import type { Cours } from '../../types/cours'

interface CoursListProps {
  cours: Cours[]
}

export function CoursList({ cours }: CoursListProps) {
  if (cours.length === 0) {
    return <p>Aucun cours importé pour le moment.</p>
  }

  return (
    <ul className="cours-list">
      {cours.map((unCours) => (
        <li key={unCours.idCours} className="cours-list__item">
          <span className="cours-list__titre">{unCours.titre}</span>
          <span className="cours-list__meta">
            Version {unCours.versionCourante} · {unCours.nbPages} pages · {unCours.nbQuiz} quiz
          </span>
        </li>
      ))}
    </ul>
  )
}
