import { describe, expect, it } from 'vitest'
import { validateFile, validateTitle } from './validation'

function pdfFile(sizeInBytes: number, name = 'cours.pdf', type = 'application/pdf'): File {
  return new File([new Uint8Array(sizeInBytes)], name, { type })
}

describe('validateTitle', () => {
  it('refuse un titre vide ou fait uniquement d’espaces', () => {
    expect(validateTitle('')).toBe('MISSING_TITLE')
    expect(validateTitle('   ')).toBe('MISSING_TITLE')
  })

  it('accepte un titre renseigné', () => {
    expect(validateTitle('Bases de données')).toBeNull()
  })
})

describe('validateFile', () => {
  it('refuse l’absence de fichier', () => {
    expect(validateFile(null)).toBe('INVALID_FORMAT')
  })

  it('refuse un fichier qui n’est pas un PDF', () => {
    expect(validateFile(pdfFile(1024, 'cours.docx', 'application/msword'))).toBe('INVALID_FORMAT')
  })

  it('refuse un PDF de plus de 50 Mo', () => {
    expect(validateFile(pdfFile(51 * 1024 * 1024))).toBe('FILE_TOO_LARGE')
  })

  it('accepte un PDF valide sous la limite', () => {
    expect(validateFile(pdfFile(2 * 1024 * 1024))).toBeNull()
  })
})
