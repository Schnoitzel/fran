import { describe, expect, it } from 'vitest'
import { createNewCardState, schedule } from './sm2'

const DAY_MS = 24 * 60 * 60 * 1000
const NOW = new Date('2026-01-01T09:00:00Z').getTime()

describe('createNewCardState', () => {
  it('startet mit Standard-Easefactor, 0 Reps, 0 Lapses und faellig jetzt', () => {
    const card = createNewCardState(NOW)
    expect(card.easeFactor).toBe(2.5)
    expect(card.reps).toBe(0)
    expect(card.lapses).toBe(0)
    expect(card.dueDate).toBe(NOW)
  })
})

describe('schedule', () => {
  it('"again" setzt reps auf 0 zurueck, erhoeht lapses, faellig sofort wieder', () => {
    const card = { easeFactor: 2.5, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW - DAY_MS }
    const next = schedule(card, 'again', NOW)
    expect(next.reps).toBe(0)
    expect(next.lapses).toBe(1)
    expect(next.intervalDays).toBe(0)
    expect(next.dueDate).toBe(NOW)
  })

  it('"again" senkt den Easefactor, aber nie unter 1.3', () => {
    const card = { easeFactor: 1.35, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const next = schedule(card, 'again', NOW)
    expect(next.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('"good" bei einer neuen Karte (rep 0 -> 1) plant fuer morgen (1 Tag)', () => {
    const card = createNewCardState(NOW)
    const next = schedule(card, 'good', NOW)
    expect(next.reps).toBe(1)
    expect(next.intervalDays).toBe(1)
    expect(next.dueDate).toBe(NOW + 1 * DAY_MS)
  })

  it('"good" bei der zweiten Wiederholung (rep 1 -> 2) plant 6 Tage', () => {
    const card = { easeFactor: 2.5, intervalDays: 1, reps: 1, lapses: 0, dueDate: NOW }
    const next = schedule(card, 'good', NOW)
    expect(next.reps).toBe(2)
    expect(next.intervalDays).toBe(6)
  })

  it('"good" ab der dritten Wiederholung multipliziert das Intervall mit dem Easefactor', () => {
    const card = { easeFactor: 2.0, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const next = schedule(card, 'good', NOW)
    expect(next.reps).toBe(3)
    expect(next.intervalDays).toBe(12) // 6 * 2.0
  })

  it('"easy" waechst schneller als "good" bei gleichem Ausgangszustand', () => {
    const cardGood = { easeFactor: 2.0, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const cardEasy = { easeFactor: 2.0, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const good = schedule(cardGood, 'good', NOW)
    const easy = schedule(cardEasy, 'easy', NOW)
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays)
  })

  it('"easy" erhoeht den Easefactor', () => {
    const card = { easeFactor: 2.0, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const next = schedule(card, 'easy', NOW)
    expect(next.easeFactor).toBeGreaterThan(2.0)
  })

  it('"hard" waechst langsamer als "good", faellt aber nicht auf 0 Reps zurueck', () => {
    const cardGood = { easeFactor: 2.0, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const cardHard = { easeFactor: 2.0, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const good = schedule(cardGood, 'good', NOW)
    const hard = schedule(cardHard, 'hard', NOW)
    expect(hard.reps).toBe(3)
    expect(hard.intervalDays).toBeLessThan(good.intervalDays)
    expect(hard.intervalDays).toBeGreaterThan(0)
  })

  it('"hard" senkt den Easefactor leicht, aber nie unter 1.3', () => {
    const card = { easeFactor: 1.35, intervalDays: 6, reps: 2, lapses: 0, dueDate: NOW }
    const next = schedule(card, 'hard', NOW)
    expect(next.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('intervalDays ist immer eine ganze Zahl (gerundet)', () => {
    const card = { easeFactor: 2.37, intervalDays: 9, reps: 3, lapses: 0, dueDate: NOW }
    const next = schedule(card, 'good', NOW)
    expect(Number.isInteger(next.intervalDays)).toBe(true)
  })
})
