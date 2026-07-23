import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UnitDetail } from './UnitDetail'
import type { Unit } from '../content/contentSchema'

const unit: Unit = {
  id: 'unit-01-greeting',
  title: 'Begrüßung & Vorstellung',
  level: 'A1',
  cefrTopic: 'A1 - Begrüßung',
  vocab: [{ front: 'a', back: 'b' }],
  dialogue: [{ speaker: 'A', fr: 'a', de: 'b' }],
  listeningQuizzes: [{ audioText: 'a', question: 'q', options: ['x', 'y'], correctIndex: 0 }],
  shadowingSentences: ['a'],
}

describe('UnitDetail', () => {
  it('zeigt Titel/Level und alle vier Aktionen an', () => {
    render(
      <UnitDetail
        unit={unit}
        onBack={vi.fn()}
        onLesson={vi.fn()}
        onPracticeVocab={vi.fn()}
        onPracticeListening={vi.fn()}
        onPracticeShadowing={vi.fn()}
      />,
    )
    expect(screen.getByText('Begrüßung & Vorstellung')).toBeInTheDocument()
    expect(screen.getByText(/Lektion ansehen/)).toBeInTheDocument()
    expect(screen.getByText(/Vokabeln üben/)).toBeInTheDocument()
    expect(screen.getByText(/Hörverständnis üben/)).toBeInTheDocument()
    expect(screen.getByText(/Shadowing üben/)).toBeInTheDocument()
  })

  it('ruft die jeweiligen Callbacks beim Antippen auf', () => {
    const onLesson = vi.fn()
    const onPracticeVocab = vi.fn()
    const onPracticeListening = vi.fn()
    const onPracticeShadowing = vi.fn()

    render(
      <UnitDetail
        unit={unit}
        onBack={vi.fn()}
        onLesson={onLesson}
        onPracticeVocab={onPracticeVocab}
        onPracticeListening={onPracticeListening}
        onPracticeShadowing={onPracticeShadowing}
      />,
    )

    fireEvent.click(screen.getByText(/Lektion ansehen/))
    fireEvent.click(screen.getByText(/Vokabeln üben/))
    fireEvent.click(screen.getByText(/Hörverständnis üben/))
    fireEvent.click(screen.getByText(/Shadowing üben/))

    expect(onLesson).toHaveBeenCalled()
    expect(onPracticeVocab).toHaveBeenCalled()
    expect(onPracticeListening).toHaveBeenCalled()
    expect(onPracticeShadowing).toHaveBeenCalled()
  })
})
