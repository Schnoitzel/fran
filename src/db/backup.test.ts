import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FranDatabase } from './db'
import { addCard } from './cardsRepo'
import { setUnitStatus, recordSessionCompletion } from './progressRepo'
import { exportBackup, importBackup } from './backup'

const NOW = new Date('2026-01-01T09:00:00Z').getTime()

let db: FranDatabase

beforeEach(() => {
  db = new FranDatabase(`test-db-${Math.random()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('exportBackup / importBackup', () => {
  it('exportiert alle Tabellen als JSON und importiert sie unveraendert in eine leere DB zurueck', async () => {
    await addCard(db, { unitId: 'unit-1', front: 'bonjour', back: 'hallo' }, NOW)
    await setUnitStatus(db, 'unit-1', 'in_progress')
    await recordSessionCompletion(db, '2026-01-01', ['vocab-review'])

    const json = await exportBackup(db)
    expect(typeof json).toBe('string')

    const freshDb = new FranDatabase(`test-db-${Math.random()}`)
    try {
      await importBackup(freshDb, json)

      const cards = await freshDb.cards.toArray()
      const progress = await freshDb.unitProgress.toArray()
      const sessions = await freshDb.sessionLog.toArray()

      expect(cards).toHaveLength(1)
      expect(cards[0]).toMatchObject({ front: 'bonjour', back: 'hallo' })
      expect(progress).toHaveLength(1)
      expect(progress[0]).toMatchObject({ unitId: 'unit-1', status: 'in_progress' })
      expect(sessions).toHaveLength(1)
    } finally {
      await freshDb.delete()
    }
  })

  it('importBackup ueberschreibt vorhandene Daten in der Ziel-DB (kein Anhaengen)', async () => {
    await addCard(db, { unitId: 'unit-old', front: 'alt', back: 'old' }, NOW)
    const json = await exportBackup(db)

    const targetDb = new FranDatabase(`test-db-${Math.random()}`)
    try {
      await addCard(targetDb, { unitId: 'unit-existing', front: 'existiert schon', back: 'x' }, NOW)
      await importBackup(targetDb, json)

      const cards = await targetDb.cards.toArray()
      expect(cards).toHaveLength(1)
      expect(cards[0].front).toBe('alt')
    } finally {
      await targetDb.delete()
    }
  })

  it('wirft einen Fehler bei kaputtem JSON', async () => {
    await expect(importBackup(db, '{nicht valides json')).rejects.toThrow()
  })
})
