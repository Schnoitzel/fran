import { describe, expect, it } from 'vitest'
import { units } from './units'

describe('gebuendelte Content-Units', () => {
  it('laedt und validiert alle JSON-Units ohne Fehler', () => {
    expect(units.length).toBeGreaterThanOrEqual(2)
  })

  it('enthaelt die Start-Units in korrekter Struktur', () => {
    const ids = units.map((u) => u.id)
    expect(ids).toContain('unit-01-greeting')
    expect(ids).toContain('unit-02-famille')
  })

  it('hat fuer jede Unit mindestens 1 Vokabel-Eintrag und 1 shadowing-Satz', () => {
    for (const unit of units) {
      expect(unit.vocab.length).toBeGreaterThan(0)
      expect(unit.shadowingSentences.length).toBeGreaterThan(0)
    }
  })
})
