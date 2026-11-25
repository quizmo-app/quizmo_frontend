import { Button } from '@/shared/ui/Button'
import { useImportCourse } from '../application/useImportCourse'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'

/** Formulaire d'import d'un cours PDF (CU1.2) : titre + fichier, erreurs du serveur mock affichées telles quelles. */
export function ImportCourseForm({
  repository,
  onImported,
  onCancel,
}: {
  repository: CourseRepository
  onImported: (course: Course) => void
  onCancel: () => void
}) {
  const { titre, setTitre, state, setFichier, submit } = useImportCourse(repository, onImported)
  const pending = state.status === 'loading'

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-(--space-3) rounded-md border border-border bg-surface-200 p-(--space-5) shadow-card"
    >
      <h2 className="typo-h2 text-ink">Importer un cours</h2>

      <label htmlFor="titre-cours" className="typo-label text-ink-muted">
        Titre du cours
      </label>
      <input
        id="titre-cours"
        type="text"
        value={titre}
        onChange={(event) => setTitre(event.target.value)}
        disabled={pending}
        autoFocus
        className="rounded-sm border border-border bg-surface-300 px-(--space-3) py-(--space-2) typo-body text-ink"
      />

      <label htmlFor="fichier-cours" className="typo-label text-ink-muted">
        Support de cours (PDF, 50 Mo maximum)
      </label>
      <input
        id="fichier-cours"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => setFichier(event.target.files?.[0] ?? null)}
        disabled={pending}
        className="typo-body text-ink file:mr-(--space-3) file:rounded-full file:border-0 file:bg-brand file:px-(--space-4) file:py-(--space-2) file:typo-button file:text-brand-ink file:cursor-pointer hover:file:brightness-110 disabled:file:cursor-not-allowed disabled:file:opacity-48"
      />

      {state.status === 'error' && (
        <p role="alert" className="rounded-sm bg-danger px-(--space-3) py-(--space-2) typo-body-small text-danger-ink">
          {state.error.message}
        </p>
      )}

      <div className="flex justify-end gap-(--space-3)">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          Annuler
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Envoi en cours…' : 'Envoyer'}
        </Button>
      </div>
    </form>
  )
}
