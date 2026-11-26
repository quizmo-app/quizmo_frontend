import { withAppErrors } from '@/shared/infrastructure/http/ApiError'
import { requestBlob } from '@/shared/infrastructure/http/httpClient'
import type { PageImage, PageThumbnailRenderer } from '../../domain/CourseRepository'

/**
 * Miniatures via GET /api/cours/{id}/versions/{n}/pages/{p} (app/presentations/router.py) :
 * le back-end renvoie un PDF d'une seule page (application/pdf), exposé en URL `blob:` et
 * affiché par le lecteur PDF du navigateur (`PageImage`). Pas de rendu PDF.js : la dépendance
 * `pdfjs-dist` n'est pas installée.
 *
 * Une version est immuable : chaque page est téléchargée une seule fois puis gardée en cache
 * (les URL `blob:` ne sont pas révoquées, le volume reste celui d'un cours).
 */
export class HttpPageThumbnailRenderer implements PageThumbnailRenderer {
  private readonly cache = new Map<string, Promise<PageImage>>()

  render(courseId: string, version: number, page: number): Promise<PageImage> {
    const key = `${courseId}:${version}:${page}`
    const cached = this.cache.get(key)
    if (cached) return cached
    const promise = withAppErrors(async () => {
      const blob = await requestBlob(`/cours/${courseId}/versions/${version}/pages/${page}`)
      return { src: URL.createObjectURL(blob), mediaType: blob.type || 'application/pdf' }
    })
    this.cache.set(key, promise)
    // En cas d'échec, l'entrée est retirée pour que « Recharger » refasse l'appel.
    promise.catch(() => this.cache.delete(key))
    return promise
  }
}
