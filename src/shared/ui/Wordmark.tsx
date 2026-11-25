/** Logo provisoire : « Quizmo » en `display-lg`, sans symbole ni mascotte (charte). */
export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`typo-display-lg text-brand ${className}`}>Quizmo</span>
}
