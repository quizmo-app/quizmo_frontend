import { useState } from 'react'
import type { FormEvent } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import type { Course } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'
import { importCourse } from '../domain/importCourse'

/** Orchestration du formulaire d'import (CU1.2) : saisie, soumission, état réseau. */
export function useImportCourse(repository: CourseRepository, onImported: (course: Course) => void) {
  const [titre, setTitre] = useState('')
  const [fichier, setFichier] = useState<File | null>(null)
  const [state, setState] = useState<AsyncState<Course>>({ status: 'idle' })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'loading' })
    try {
      const course = await importCourse(repository, titre, fichier)
      setState({ status: 'success', data: course })
      onImported(course)
    } catch (error) {
      setState({ status: 'error', error: AppError.from(error) })
    }
  }

  return { titre, setTitre, fichier, setFichier, state, submit }
}
