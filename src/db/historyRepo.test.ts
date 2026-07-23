import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FranDatabase } from './db'
import { buildDailyActivity, getDailyActivity } from './historyRepo'
import { recordSessionCompletion } from './progressRepo'

describe('buildDailyActivity', () => {
  it('gruppiert sessionLog-Eintraege pro Tag inkl. unitId und completedBlocks', () => {
    const activity = buildDailyActivity(
      [
        { date: '2026-01-01', completedBlocks: ['lesson-input'], streakCount: 1, unitId: 'unit-1' },
        { date: '2026-01-02', completedBlocks: ['vocab-review'], streakCount: 2, unitId: null },
      ],
      [],
    )
    expect(activity).toHaveLength(2)
    expect(activity[0]).toMatchObject({ date: '2026-01-02', unitId: null, reviewCount: 0 })
    expect(activity[1]).toMatchObject({ date: '2026-01-01', unitId: 'unit-1', reviewCount: 0 })
  })

  it('sortiert absteigend nach Datum (neueste zuerst)', () => {
    const activity = buildDailyActivity(
      [
        { date: '2026-01-01', completedBlocks: [], streakCount: 1, unitId: null },
        { date: '2026-01-03', completedBlocks: [], streakCount: 1, unitId: null },
        { date: '2026-01-02', completedBlocks: [], streakCount: 1, unitId: null },
      ],
      [],
    )
    expect(activity.map((a) => a.date)).toEqual(['2026-01-03', '2026-01-02', '2026-01-01'])
  })

  it('zaehlt reviewLog-Eintraege pro Tag, auch ohne zugehoerigen sessionLog-Eintrag', () => {
    const jan1 = new Date('2026-01-01T10:00:00Z').getTime()
    const jan1Later = new Date('2026-01-01T18:00:00Z').getTime()
    const jan2 = new Date('2026-01-02T09:00:00Z').getTime()

    const activity = buildDailyActivity(
      [],
      [
        { id: 1, cardId: 1, timestamp: jan1, rating: 'good' },
        { id: 2, cardId: 2, timestamp: jan1Later, rating: 'easy' },
        { id: 3, cardId: 3, timestamp: jan2, rating: 'again' },
      ],
    )
    expect(activity).toHaveLength(2)
    const day1 = activity.find((a) => a.date === '2026-01-01')
    expect(day1?.reviewCount).toBe(2)
    expect(day1?.unitId).toBeNull()
  })

  it('gibt eine leere Liste zurueck, wenn nichts geloggt wurde', () => {
    expect(buildDailyActivity([], [])).toEqual([])
  })
})

let db: FranDatabase

beforeEach(() => {
  db = new FranDatabase(`test-db-${Math.random()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('getDailyActivity', () => {
  it('liest sessionLog + reviewLog aus der DB und baut die Tagesuebersicht', async () => {
    await recordSessionCompletion(db, '2026-01-01', ['lesson-input'], 'unit-1')
    await db.reviewLog.add({ cardId: 1, timestamp: Date.now(), rating: 'good' })

    const activity = await getDailyActivity(db)
    expect(activity.length).toBeGreaterThanOrEqual(1)
    const jan1 = activity.find((a) => a.date === '2026-01-01')
    expect(jan1?.unitId).toBe('unit-1')
  })
})
