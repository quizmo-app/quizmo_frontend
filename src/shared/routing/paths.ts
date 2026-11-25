/** Chemins de navigation partagés entre fonctionnalités. */
export const paths = {
  dashboard: '/tableau-de-bord',
  presentation: (courseId: string) => `/cours/${encodeURIComponent(courseId)}/presenter`,
  login: (redirectTo?: string) =>
    redirectTo ? `/connexion?redirection=${encodeURIComponent(redirectTo)}` : '/connexion',
}

/** N'accepte que des chemins internes (protection contre les redirections ouvertes). */
export function safeRedirect(target: string | null | undefined, fallback: string = paths.dashboard): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback
  return target
}

/** Message flash transmis via l'état de navigation (ex. « Présentation terminée »). */
export interface FlashState {
  flash?: { tone: 'success' | 'info'; message: string }
}
