import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VocabReview } from './VocabReview'
import type { CardRecord } from '../db/db'

function fakeCard(id: number, front: string): CardRecord {
  return {
    id,
    unitId: 'unit-1',
    front,
    back: `back-${front}`,
    easeFactor: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueDate: 0,
  }
}

describe('VocabReview', () => {
  it('zeigt die Rueckseite erst nach Antippen und ruft onRate mit der gewaehlten Bewertung auf', async () => {
    const onRate = vi.fn().mockResolvedValue(undefined)
    const onDone = vi.fn()
    render(<VocabReview cards={[fakeCard(1, 'bonjour')]} onRate={onRate} onDone={onDone} />)

    expect(screen.getByText('bonjour')).toBeInTheDocument()
    expect(screen.queryByText('back-bonjour')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('bonjour'))
    expect(screen.getByText('back-bonjour')).toBeInTheDocument()

    fireEvent.click(screen.getByText('🙂 Gut'))
    expect(onRate).toHaveBeenCalledWith(1, 'good')
  })

  it('ruft onDone auf, wenn keine Karten mehr da sind', () => {
    const onDone = vi.fn()
    render(<VocabReview cards={[]} onRate={vi.fn()} onDone={onDone} />)
    expect(onDone).toHaveBeenCalled()
  })
})
