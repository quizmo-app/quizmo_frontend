import { useCallback, useEffect, useState } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'
import { listMyCourses } from '../domain/listMyCourses'

/** Orchestration du tableau de bord : chargement / succès / vide / erreur. */
export function useMyCourses(repository: CourseRepository) {
  const [state, setState] = useState<AsyncState<Course[]>>({ status: 'loading' })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    listMyCourses(repository).then(
      (courses) => {
        if (!cancelled) setState(courses.length === 0 ? { status: 'empty' } : { status: 'success', data: courses })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: AppError.from(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { state, reload }
}
