import { describe, expect, it } from 'vitest'
import { buildTodayPlan } from './dailyPlan'
import type { Unit } from '../content/contentSchema'

function fakeUnit(id: string): Unit {
  return {
    id,
    title: id,
    cefrTopic: 'A1',
    vocab: [{ front: 'a', back: 'b' }],
    dialogue: [{ speaker: 'A', fr: 'a', de: 'b' }],
    listeningQuiz: { audioText: 'a', question: 'q', options: ['x', 'y'], correctIndex: 0 },
    shadowingSentences: ['a'],
  }
}

const units = [fakeUnit('unit-1'), fakeUnit('unit-2'), fakeUnit('unit-3')]

describe('buildTodayPlan', () => {
  it('erster Tag: keine Fortschrittsdaten, keine faelligen Karten -> erste Unit wird eingefuehrt, kein vocab-review', () => {
    const plan = buildTodayPlan({ dueCardIds: [], units, unitStatusById: {} })
    expect(plan.currentUnitId).toBe('unit-1')
    expect(plan.blocks).toEqual(['lesson-input', 'listening-quiz', 'shadowing'])
    expect(plan.dueCardIds).toEqual([])
  })

  it('faellige Karten vorhanden und eine Unit in Bearbeitung -> alle Bloecke enthalten', () => {
    const plan = buildTodayPlan({
      dueCardIds: [1, 2, 3],
      units,
      unitStatusById: { 'unit-1': 'in_progress' },
    })
    expect(plan.currentUnitId).toBe('unit-1')
    expect(plan.blocks).toEqual(['vocab-review', 'lesson-input', 'listening-quiz', 'shadowing'])
  })

  it('nichts faellig -> kein vocab-review-Block', () => {
    const plan = buildTodayPlan({
      dueCardIds: [],
      units,
      unitStatusById: { 'unit-1': 'in_progress' },
    })
    expect(plan.blocks).not.toContain('vocab-review')
  })

  it('waehlt "in_progress" vor "available" und vor "locked"', () => {
    const plan = buildTodayPlan({
      dueCardIds: [],
      units,
      unitStatusById: { 'unit-1': 'available', 'unit-2': 'in_progress' },
    })
    expect(plan.currentUnitId).toBe('unit-2')
  })

  it('waehlt "available" vor "locked", wenn keine Unit in_progress ist', () => {
    const plan = buildTodayPlan({
      dueCardIds: [],
      units,
      unitStatusById: { 'unit-1': 'done', 'unit-2': 'available' },
    })
    expect(plan.currentUnitId).toBe('unit-2')
  })

  it('ueberspringt "done"-Units und nimmt die naechste locked Unit, wenn nichts anderes offen ist', () => {
    const plan = buildTodayPlan({
      dueCardIds: [],
      units,
      unitStatusById: { 'unit-1': 'done' },
    })
    expect(plan.currentUnitId).toBe('unit-2')
  })

  it('alle Units durch, keine faelligen Karten -> leerer Plan (nichts zu tun heute)', () => {
    const plan = buildTodayPlan({
      dueCardIds: [],
      units,
      unitStatusById: { 'unit-1': 'done', 'unit-2': 'done', 'unit-3': 'done' },
    })
    expect(plan.currentUnitId).toBeNull()
    expect(plan.blocks).toEqual([])
  })

  it('alle Units durch, aber Karten faellig -> nur vocab-review', () => {
    const plan = buildTodayPlan({
      dueCardIds: [1],
      units,
      unitStatusById: { 'unit-1': 'done', 'unit-2': 'done', 'unit-3': 'done' },
    })
    expect(plan.currentUnitId).toBeNull()
    expect(plan.blocks).toEqual(['vocab-review'])
  })
})
