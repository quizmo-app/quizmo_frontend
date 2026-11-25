import { useCallback, useState } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'
import { deleteCourse } from '../domain/useCases'

type Target = Pick<Course, 'id' | 'title' | 'hasActivePresentation'>

/**
 * EF-07 : demande de suppression → confirmation explicite → suppression + purge RGPD.
 * `pending` = cours dont la confirmation est affichée.
 */
export function useCourseDeletion(repository: CourseRepository) {
  const [pending, setPending] = useState<Target | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const request = useCallback((course: Target) => {
    setError(null)
    setPending(course)
  }, [])

  const cancel = useCallback(() => {
    if (deleting) return
    setPending(null)
    setError(null)
  }, [deleting])

  /** Renvoie le cours supprimé, ou null si la suppression a échoué (l'erreur reste affichée dans la confirmation). */
  const confirm = useCallback(async (): Promise<Target | null> => {
    if (!pending) return null
    setDeleting(true)
    setError(null)
    try {
      await deleteCourse(repository, pending)
      const deleted = pending
      setPending(null)
      return deleted
    } catch (e) {
      setError(AppError.from(e))
      return null
    } finally {
      setDeleting(false)
    }
  }, [repository, pending])

  return { pending, deleting, error, request, cancel, confirm }
}
