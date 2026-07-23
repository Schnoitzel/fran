import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FranDatabase } from './db'
import {
  getUnitProgress,
  recordSessionCompletion,
  setUnitStatus,
} from './progressRepo'

let db: FranDatabase

beforeEach(() => {
  db = new FranDatabase(`test-db-${Math.random()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('setUnitStatus / getUnitProgress', () => {
  it('legt eine Unit mit Status an und liest sie wieder aus', async () => {
    await setUnitStatus(db, 'unit-1', 'in_progress')
    const progress = await getUnitProgress(db, 'unit-1')
    expect(progress).toMatchObject({ unitId: 'unit-1', status: 'in_progress' })
  })

  it('gibt "locked" als Default zurueck, wenn keine Unit angelegt wurde', async () => {
    const progress = await getUnitProgress(db, 'unbekannte-unit')
    expect(progress).toMatchObject({ unitId: 'unbekannte-unit', status: 'locked' })
  })
})

describe('recordSessionCompletion', () => {
  it('legt fuer den ersten Tag einen Streak von 1 an', async () => {
    const log = await recordSessionCompletion(db, '2026-01-01', ['vocab', 'listening'])
    expect(log).toMatchObject({
      date: '2026-01-01',
      completedBlocks: ['vocab', 'listening'],
      streakCount: 1,
    })
  })

  it('erhoeht den Streak, wenn der Vortag ebenfalls abgeschlossen wurde', async () => {
    await recordSessionCompletion(db, '2026-01-01', ['vocab'])
    const log = await recordSessionCompletion(db, '2026-01-02', ['vocab'])
    expect(log.streakCount).toBe(2)
  })

  it('setzt den Streak zurueck auf 1, wenn ein Tag ausgelassen wurde', async () => {
    await recordSessionCompletion(db, '2026-01-01', ['vocab'])
    const log = await recordSessionCompletion(db, '2026-01-05', ['vocab'])
    expect(log.streakCount).toBe(1)
  })
})
