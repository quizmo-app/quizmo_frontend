import type { LeaderboardItem } from '../../domain/PresentationPlan'

const PODIUM = ['bg-podium-gold', 'bg-podium-silver', 'bg-podium-bronze']
const RANK_INK = ['text-podium-gold', 'text-podium-silver', 'text-podium-bronze']

/**
 * État « PageLeaderboard » : emplacement réservé au CU3.2 (classement animé).
 * Les barres sont décoratives : aucune donnée de classement n'est inventée ici.
 * L'animation de montée est la seule animation prolongée autorisée par la charte.
 */
export function LeaderboardSlide({ leaderboard }: { leaderboard: LeaderboardItem }) {
  const widths = [92, 80, 71, 63, 55]
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex aspect-video w-full max-w-6xl flex-col rounded-lg border border-border bg-surface-200 p-(--space-7) shadow-podium">
        <span className="typo-label text-accent">Classement</span>
        <h2 className="mt-(--space-3) typo-display-lg text-ink">{leaderboard.title}</h2>
        <ol className="mt-(--space-6) flex flex-1 flex-col justify-center gap-(--space-3)" aria-hidden="true">
          {widths.map((width, rank) => (
            <li key={rank} className="flex items-center gap-(--space-4)">
              <span className={`w-12 text-right typo-h2 ${RANK_INK[rank] ?? 'text-ink-muted'}`}>{rank + 1}</span>
              <span
                className={`h-12 origin-left animate-podium-rise rounded-full ${PODIUM[rank] ?? 'bg-surface-300'}`}
                style={{ width: `${width}%`, animationDelay: `${rank * 120}ms` }}
              />
            </li>
          ))}
        </ol>
        <p className="mt-(--space-5) typo-body-small text-ink-muted">Le classement animé sera fourni par le CU3.2.</p>
      </div>
    </div>
  )
}
