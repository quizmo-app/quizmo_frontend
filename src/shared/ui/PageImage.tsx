/**
 * Affiche une page de cours : une image (mock : SVG) ou un PDF d'une seule page (back-end réel),
 * rendu par le lecteur PDF intégré du navigateur. L'iframe ne capte ni le clic ni le focus,
 * pour que les raccourcis clavier de la présentation et les boutons voisins restent actifs.
 */
export function PageImage({
  src,
  mediaType,
  alt,
  className = '',
}: {
  src: string
  mediaType: string
  alt: string
  className?: string
}) {
  if (mediaType === 'application/pdf') {
    return (
      <iframe
        src={`${src}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
        title={alt}
        tabIndex={-1}
        className={`pointer-events-none border-0 bg-white ${className}`}
      />
    )
  }
  return <img src={src} alt={alt} className={className} draggable={false} />
}
