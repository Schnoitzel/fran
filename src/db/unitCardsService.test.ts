import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FranDatabase } from './db'
import { ensureUnitStarted } from './unitCardsService'
import type { Unit } from '../content/contentSchema'

const NOW = new Date('2026-01-01T09:00:00Z').getTime()

const unit: Unit = {
  id: 'unit-1',
  title: 'Test-Unit',
  cefrTopic: 'A1',
  vocab: [
    { front: 'bonjour', back: 'hallo' },
    { front: 'merci', back: 'danke' },
  ],
  dialogue: [{ speaker: 'A', fr: 'a', de: 'b' }],
  listeningQuiz: { audioText: 'a', question: 'q', options: ['x', 'y'], correctIndex: 0 },
  shadowingSentences: ['a'],
}

let db: FranDatabase

beforeEach(() => {
  db = new FranDatabase(`test-db-${Math.random()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('ensureUnitStarted', () => {
  it('legt beim ersten Aufruf alle Vokabeln der Unit als Karten an und setzt Status auf in_progress', async () => {
    const progress = await ensureUnitStarted(db, unit, NOW)

    expect(progress.status).toBe('in_progress')
    expect(progress.introducedCardIds).toHaveLength(2)

    const cards = await db.cards.where('unitId').equals('unit-1').toArray()
    expect(cards).toHaveLength(2)
    expect(cards.map((c) => c.front).sort()).toEqual(['bonjour', 'merci'])
  })

  it('legt beim zweiten Aufruf keine doppelten Karten an', async () => {
    await ensureUnitStarted(db, unit, NOW)
    const progress = await ensureUnitStarted(db, unit, NOW + 1000)

    const cards = await db.cards.where('unitId').equals('unit-1').toArray()
    expect(cards).toHaveLength(2)
    expect(progress.introducedCardIds).toHaveLength(2)
  })

  it('setzt eine bereits "done"-Unit nicht zurueck auf in_progress', async () => {
    await ensureUnitStarted(db, unit, NOW)
    await db.unitProgress.update('unit-1', { status: 'done' })

    const progress = await ensureUnitStarted(db, unit, NOW + 1000)

    expect(progress.status).toBe('done')
  })
})
