import { useCallback, useEffect, useState } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'

/** Orchestration de la page de détail d'un cours : chargement / succès / erreur. */
export function useCourse(repository: CourseRepository, courseId: string) {
  const [state, setState] = useState<AsyncState<Course>>({ status: 'loading' })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    repository.getCourse(courseId).then(
      (course) => {
        if (!cancelled) setState({ status: 'success', data: course })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: AppError.from(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository, courseId, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { state, reload }
}
