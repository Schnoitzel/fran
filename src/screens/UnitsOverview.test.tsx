import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UnitsOverview } from './UnitsOverview'
import type { Unit } from '../content/contentSchema'

function unit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'unit-01-greeting',
    title: 'Begrüßung & Vorstellung',
    level: 'A1',
    cefrTopic: 'A1 - Begrüßung',
    vocab: [{ front: 'a', back: 'b' }],
    dialogue: [{ speaker: 'A', fr: 'a', de: 'b' }],
    listeningQuizzes: [{ audioText: 'a', question: 'q', options: ['x', 'y'], correctIndex: 0 }],
    shadowingSentences: ['a'],
    ...overrides,
  }
}

describe('UnitsOverview', () => {
  it('listet alle Units mit Titel und Level auf und erlaubt freies Anwaehlen', () => {
    const onSelect = vi.fn()
    const units = [unit(), unit({ id: 'unit-02-famille', title: 'Familie', level: 'A1' })]

    render(<UnitsOverview units={units} statusByUnitId={{}} onSelect={onSelect} onBack={vi.fn()} />)

    expect(screen.getByText('Begrüßung & Vorstellung')).toBeInTheDocument()
    expect(screen.getByText('Familie')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Familie'))
    expect(onSelect).toHaveBeenCalledWith('unit-02-famille')
  })

  it('zeigt einen Status-Hinweis, wenn eine Unit bereits abgeschlossen ist', () => {
    const units = [unit()]
    render(
      <UnitsOverview
        units={units}
        statusByUnitId={{ 'unit-01-greeting': 'done' }}
        onSelect={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText(/erledigt|done|abgeschlossen/i)).toBeInTheDocument()
  })

  it('ruft onBack auf, wenn Zurueck angetippt wird', () => {
    const onBack = vi.fn()
    render(<UnitsOverview units={[unit()]} statusByUnitId={{}} onSelect={vi.fn()} onBack={onBack} />)
    fireEvent.click(screen.getByText(/Zurück/))
    expect(onBack).toHaveBeenCalled()
  })
})
