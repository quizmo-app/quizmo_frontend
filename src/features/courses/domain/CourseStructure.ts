/**
 * Structure d'un cours dans l'éditeur (EF-03) : pages de la version active
 * et emplacements des quiz / classements, chacun placé « après la page n ».
 */
export interface CourseStructure {
  courseId: string
  title: string
  /** Numéro de la version active (v_k). */
  version: number
  pageCount: number
  insertions: Insertion[]
  /** Une présentation est en cours : le cours est verrouillé (diagramme d'états). */
  locked: boolean
  archived: boolean
}

export type InsertionKind = 'quiz' | 'leaderboard'

export interface Insertion {
  id: string
  kind: InsertionKind
  title: string
  /** Nombre de questions (quiz uniquement). */
  questionCount?: number
  /** Page après laquelle l'insertion est affichée, entre 0 (avant la première page) et `pageCount`. */
  afterPage: number
  /** Ordre entre plusieurs insertions placées après la même page (1, 2, …). */
  order: number
}

/** Position envoyée au back-end lors de l'enregistrement (EF-06). */
export interface InsertionPlacement {
  id: string
  afterPage: number
  order: number
}

// ───────────────────────────── Règles métier pures ─────────────────────────────

/** Insertions placées après la page `page`, dans l'ordre d'affichage. */
export function insertionsAfter(insertions: Insertion[], page: number): Insertion[] {
  return insertions.filter((i) => i.afterPage === page).sort((a, b) => a.order - b.order)
}

/** Ordre d'affichage global : par page, puis par ordre. */
export function sortInsertions(insertions: Insertion[]): Insertion[] {
  return [...insertions].sort((a, b) => a.afterPage - b.afterPage || a.order - b.order)
}

/** Renumérote `order` de 1 à n pour chaque page, en conservant l'ordre relatif. */
export function normalizeOrders(insertions: Insertion[]): Insertion[] {
  const counters = new Map<number, number>()
  return sortInsertions(insertions).map((insertion) => {
    const order = (counters.get(insertion.afterPage) ?? 0) + 1
    counters.set(insertion.afterPage, order)
    return { ...insertion, order }
  })
}

export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(Math.round(page), 0), Math.max(pageCount, 0))
}

/** Déplace une insertion après la page `afterPage` (bornée à 0..N), en dernière position de cette page. */
export function moveInsertion(insertions: Insertion[], id: string, afterPage: number, pageCount: number): Insertion[] {
  const target = clampPage(afterPage, pageCount)
  const current = insertions.find((i) => i.id === id)
  if (!current || current.afterPage === target) return insertions
  const lastOrder = Math.max(0, ...insertions.filter((i) => i.afterPage === target).map((i) => i.order))
  return normalizeOrders(insertions.map((i) => (i.id === id ? { ...i, afterPage: target, order: lastOrder + 1 } : i)))
}

/**
 * Avance (+1) ou recule (-1) une insertion d'un cran dans le plan :
 * échange avec sa voisine sur la même page, sinon passe à la page voisine.
 */
export function shiftInsertion(insertions: Insertion[], id: string, direction: -1 | 1, pageCount: number): Insertion[] {
  const current = insertions.find((i) => i.id === id)
  if (!current) return insertions
  const siblings = insertionsAfter(insertions, current.afterPage)
  const index = siblings.findIndex((i) => i.id === id)
  const neighbour = siblings[index + direction]

  if (neighbour) {
    return normalizeOrders(
      insertions.map((i) => {
        if (i.id === current.id) return { ...i, order: neighbour.order }
        if (i.id === neighbour.id) return { ...i, order: current.order }
        return i
      }),
    )
  }

  const targetPage = current.afterPage + direction
  if (targetPage < 0 || targetPage > pageCount) return insertions
  // En reculant, l'insertion arrive en fin de la page précédente ; en avançant, en tête de la suivante.
  const order = direction === -1 ? Number.MAX_SAFE_INTEGER : 0
  return normalizeOrders(insertions.map((i) => (i.id === id ? { ...i, afterPage: targetPage, order } : i)))
}

export function canShift(insertions: Insertion[], id: string, direction: -1 | 1, pageCount: number): boolean {
  return shiftInsertion(insertions, id, direction, pageCount) !== insertions
}

export function toPlacements(insertions: Insertion[]): InsertionPlacement[] {
  return normalizeOrders(insertions).map(({ id, afterPage, order }) => ({ id, afterPage, order }))
}

/** Vrai si les positions diffèrent de celles enregistrées. */
export function hasPlacementChanges(saved: Insertion[], current: Insertion[]): boolean {
  const key = (list: Insertion[]) =>
    toPlacements(list)
      .map((p) => `${p.id}@${p.afterPage}.${p.order}`)
      .join('|')
  return key(saved) !== key(current)
}

/**
 * Contrôle avant enregistrement (EF-06) : chaque insertion reste entre 0 (avant la première page)
 * et la page N — la même règle que la création (CU1.3/CU1.4) et la présentation (CU2.1).
 */
export function findMisplacedInsertions(insertions: Insertion[], pageCount: number): Insertion[] {
  return insertions.filter((i) => !Number.isInteger(i.afterPage) || i.afterPage < 0 || i.afterPage > pageCount)
}
