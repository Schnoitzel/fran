import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FranDatabase } from '../db/db'
import { useTodaySession } from './useTodaySession'
import type { Unit } from '../content/contentSchema'

function fakeUnit(id: string): Unit {
  return {
    id,
    title: id,
    cefrTopic: 'A1',
    vocab: [{ front: 'bonjour', back: 'hallo' }],
    dialogue: [{ speaker: 'A', fr: 'a', de: 'b' }],
    listeningQuiz: { audioText: 'a', question: 'q', options: ['x', 'y'], correctIndex: 0 },
    shadowingSentences: ['a'],
  }
}

const units = [fakeUnit('unit-1'), fakeUnit('unit-2')]

let db: FranDatabase

beforeEach(() => {
  db = new FranDatabase(`test-db-${Math.random()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('useTodaySession', () => {
  it('laedt am ersten Tag einen Plan mit der ersten Unit, ohne vocab-review', async () => {
    const { result } = renderHook(() => useTodaySession(db, units))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.currentUnit?.id).toBe('unit-1')
    expect(result.current.plan?.blocks).toEqual(['lesson-input', 'listening-quiz', 'shadowing'])
  })

  it('startCurrentUnit fuehrt Vokabelkarten ein und markiert die Unit als in_progress', async () => {
    const { result } = renderHook(() => useTodaySession(db, units))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.startCurrentUnit()
    })

    const progress = await db.unitProgress.get('unit-1')
    expect(progress?.status).toBe('in_progress')
    const cards = await db.cards.where('unitId').equals('unit-1').toArray()
    expect(cards).toHaveLength(1)
  })

  it('rate() entfernt die Karte aus dueCards und speichert die Bewertung', async () => {
    await db.cards.add({
      unitId: 'unit-1',
      front: 'bonjour',
      back: 'hallo',
      easeFactor: 2.5,
      intervalDays: 0,
      reps: 0,
      lapses: 0,
      dueDate: Date.now() - 1000,
    })

    const { result } = renderHook(() => useTodaySession(db, units))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.dueCards).toHaveLength(1)

    const cardId = result.current.dueCards[0].id as number
    await act(async () => {
      await result.current.rate(cardId, 'good')
    })

    expect(result.current.dueCards).toHaveLength(0)
    const logs = await db.reviewLog.toArray()
    expect(logs).toHaveLength(1)
  })

  it('nextBlock erhoeht den blockIndex, completeSession schreibt den Streak fort', async () => {
    const { result } = renderHook(() => useTodaySession(db, units))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.nextBlock()
    })
    expect(result.current.blockIndex).toBe(1)

    await act(async () => {
      await result.current.completeSession()
    })
    expect(result.current.streak).toBe(1)
  })
})
