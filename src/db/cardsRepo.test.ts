import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FranDatabase } from './db'
import { addCard, getDueCards, reviewCard } from './cardsRepo'

const NOW = new Date('2026-01-01T09:00:00Z').getTime()
const DAY_MS = 24 * 60 * 60 * 1000

let db: FranDatabase

beforeEach(() => {
  db = new FranDatabase(`test-db-${Math.random()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('addCard', () => {
  it('legt eine neue Karte mit Standard-SM2-Zustand an, faellig jetzt', async () => {
    const id = await addCard(db, { unitId: 'unit-1', front: 'bonjour', back: 'hallo' }, NOW)
    const card = await db.cards.get(id)
    expect(card).toMatchObject({
      unitId: 'unit-1',
      front: 'bonjour',
      back: 'hallo',
      easeFactor: 2.5,
      reps: 0,
      lapses: 0,
      dueDate: NOW,
    })
  })
})

describe('getDueCards', () => {
  it('liefert nur Karten, deren dueDate <= now ist, sortiert nach dueDate', async () => {
    const laterId = await addCard(db, { unitId: 'unit-1', front: 'a', back: 'b' }, NOW + DAY_MS)
    const dueLateId = await addCard(db, { unitId: 'unit-1', front: 'c', back: 'd' }, NOW - 1000)
    const dueEarlyId = await addCard(db, { unitId: 'unit-1', front: 'e', back: 'f' }, NOW - DAY_MS)

    const due = await getDueCards(db, NOW)

    expect(due.map((c) => c.id)).toEqual([dueEarlyId, dueLateId])
    expect(due.map((c) => c.id)).not.toContain(laterId)
  })
})

describe('reviewCard', () => {
  it('wendet das SM2-Rating an, aktualisiert die Karte und schreibt einen Log-Eintrag', async () => {
    const id = await addCard(db, { unitId: 'unit-1', front: 'bonjour', back: 'hallo' }, NOW)

    const updated = await reviewCard(db, id, 'good', NOW)

    expect(updated.reps).toBe(1)
    expect(updated.intervalDays).toBe(1)
    expect(updated.dueDate).toBe(NOW + DAY_MS)

    const logs = await db.reviewLog.where('cardId').equals(id).toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({ cardId: id, timestamp: NOW, rating: 'good' })
  })

  it('wirft einen Fehler, wenn die Karte nicht existiert', async () => {
    await expect(reviewCard(db, 999, 'good', NOW)).rejects.toThrow()
  })
})
