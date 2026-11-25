/** Génère une page de cours factice (SVG 16:9) en lieu et place du rendu PDF du PdfService. */
export function renderPageSvg(params: {
  courseTitle: string
  pageTitle: string
  points: string[]
  pageNumber: number
  pageCount: number
  version: number
  accent: string
}): string {
  const { courseTitle, pageTitle, points, pageNumber, pageCount, version, accent } = params
  const isCover = pageNumber === 1
  const bullets = points
    .map(
      (point, i) =>
        `<g transform="translate(140 ${isCover ? 560 + i * 60 : 360 + i * 90})">` +
        (isCover ? '' : `<circle cx="0" cy="-14" r="10" fill="${accent}"/>`) +
        `<text x="${isCover ? 0 : 40}" y="0" font-size="${isCover ? 40 : 46}" fill="${isCover ? '#475569' : '#1e293b'}">${escapeXml(point)}</text></g>`,
    )
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" font-family="Segoe UI, system-ui, sans-serif">
  <rect width="1920" height="1080" fill="#ffffff"/>
  <rect width="1920" height="${isCover ? 1080 : 16}" fill="${accent}" opacity="${isCover ? 0.08 : 1}"/>
  <rect x="140" y="${isCover ? 400 : 250}" width="${isCover ? 200 : 120}" height="10" rx="5" fill="${accent}"/>
  <text x="140" y="${isCover ? 360 : 210}" font-size="${isCover ? 96 : 72}" font-weight="700" fill="#0f172a">${escapeXml(pageTitle)}</text>
  ${bullets}
  <text x="140" y="1020" font-size="28" fill="#94a3b8">${escapeXml(courseTitle)} · v${version}</text>
  <text x="1780" y="1020" font-size="28" fill="#94a3b8" text-anchor="end">${pageNumber} / ${pageCount}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
