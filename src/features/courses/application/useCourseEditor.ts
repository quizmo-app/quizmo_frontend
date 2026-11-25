import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppError } from '@/shared/domain/AppError'
import type { AsyncState } from '@/shared/domain/AsyncState'
import { managementLock } from '../domain/Course'
import type { CourseRepository } from '../domain/CourseRepository'
import {
  canShift,
  hasPlacementChanges,
  moveInsertion,
  shiftInsertion,
  type CourseStructure,
  type Insertion,
} from '../domain/CourseStructure'
import { saveStructure } from '../domain/useCases'

type SaveState = { status: 'idle' } | { status: 'saving' } | { status: 'saved' } | { status: 'error'; error: AppError }

/**
 * Orchestration de l'éditeur de cours (EF-03, EF-06) :
 * chargement de la structure, déplacement des quiz, enregistrement.
 */
export function useCourseEditor(repository: CourseRepository, courseId: string) {
  const [state, setState] = useState<AsyncState<CourseStructure>>({ status: 'loading' })
  /** Positions de travail (non enregistrées). */
  const [draft, setDraft] = useState<Insertion[]>([])
  const [save, setSave] = useState<SaveState>({ status: 'idle' })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    repository.getStructure(courseId).then(
      (structure) => {
        if (cancelled) return
        setState({ status: 'success', data: structure })
        setDraft(structure.insertions)
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: AppError.from(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository, courseId, reloadToken])

  const structure = state.status === 'success' ? state.data : null
  const lock = structure ? managementLock({ hasActivePresentation: structure.locked, archived: structure.archived }) : null
  const dirty = structure ? hasPlacementChanges(structure.insertions, draft) : false

  const edit = useCallback(
    (change: (insertions: Insertion[], pageCount: number) => Insertion[]) => {
      if (!structure || lock) return
      setDraft((current) => change(current, structure.pageCount))
      setSave({ status: 'idle' })
    },
    [structure, lock],
  )

  const actions = useMemo(
    () => ({
      moveTo: (id: string, afterPage: number) => edit((list, n) => moveInsertion(list, id, afterPage, n)),
      shift: (id: string, direction: -1 | 1) => edit((list, n) => shiftInsertion(list, id, direction, n)),
      canShift: (id: string, direction: -1 | 1) =>
        Boolean(structure) && !lock && canShift(draft, id, direction, structure!.pageCount),
      discard: () => {
        if (structure) setDraft(structure.insertions)
        setSave({ status: 'idle' })
      },
      reload: () => setReloadToken((t) => t + 1),
    }),
    [edit, structure, lock, draft],
  )

  /** EF-06 : enregistrer la structure cours + quiz. */
  const saveDraft = useCallback(async () => {
    if (!structure) return
    setSave({ status: 'saving' })
    try {
      await saveStructure(repository, structure, draft)
      setState({ status: 'success', data: { ...structure, insertions: draft } })
      setSave({ status: 'saved' })
    } catch (error) {
      setSave({ status: 'error', error: AppError.from(error) })
    }
  }, [repository, structure, draft])

  return {
    state,
    structure,
    draft,
    dirty,
    lock,
    save,
    saveDraft,
    ...actions,
  }
}
