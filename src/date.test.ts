import { describe, expect, it } from 'vitest'
import { todayDateString } from './date'

describe('todayDateString', () => {
  it('formatiert einen Zeitstempel als YYYY-MM-DD (UTC)', () => {
    const ts = new Date('2026-03-05T23:30:00Z').getTime()
    expect(todayDateString(ts)).toBe('2026-03-05')
  })

  it('nutzt Date.now() als Default', () => {
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
