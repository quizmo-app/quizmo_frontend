import type { CoursePageItem, PlanItem, PresentationPlan } from './PresentationPlan'

/** Requêtes pures sur le plan de présentation. */

export function clampIndex(plan: PresentationPlan, index: number): number {
  if (plan.items.length === 0) return 0
  return Math.min(Math.max(Math.trunc(index), 0), plan.items.length - 1)
}

export function itemAt(plan: PresentationPlan, index: number): PlanItem | undefined {
  return plan.items[index]
}

export function isFirst(index: number): boolean {
  return index <= 0
}

export function isLast(plan: PresentationPlan, index: number): boolean {
  return index >= plan.items.length - 1
}

/** Prochaine page de cours après `fromIndex` (cible du préchargement). */
export function nextCoursePage(
  plan: PresentationPlan,
  fromIndex: number,
): { index: number; item: CoursePageItem } | undefined {
  for (let i = fromIndex + 1; i < plan.items.length; i++) {
    const item = plan.items[i]
    if (item.kind === 'course-page') return { index: i, item }
  }
  return undefined
}

/** Position dans le plan d'une page PDF donnée (navigation « page n » par numéro de page PDF). */
export function indexOfPdfPage(plan: PresentationPlan, pdfPage: number): number | undefined {
  const index = plan.items.findIndex((item) => item.kind === 'course-page' && item.pdfPage === pdfPage)
  return index === -1 ? undefined : index
}

export function itemLabel(item: PlanItem): string {
  switch (item.kind) {
    case 'course-page':
      return `Page ${item.pdfPage}`
    case 'quiz':
      return `Quiz · ${item.title}`
    case 'leaderboard':
      return `Classement · ${item.title}`
  }
}
