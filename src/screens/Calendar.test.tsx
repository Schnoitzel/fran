import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'
import type { DailyActivity } from '../db/historyRepo'
import type { Unit } from '../content/contentSchema'

function unit(id: string, title: string): Unit {
  return {
    id,
    title,
    cefrTopic: 'A1',
    vocab: [{ front: 'a', back: 'b' }],
    dialogue: [{ speaker: 'A', fr: 'a', de: 'b' }],
    listeningQuizzes: [{ audioText: 'a', question: 'q', options: ['x', 'y'], correctIndex: 0 }],
    shadowingSentences: ['a'],
  }
}

const activity: DailyActivity[] = [
  { date: '2026-01-05', completedBlocks: ['lesson-input', 'shadowing'], unitId: 'unit-01', reviewCount: 3 },
  { date: '2026-01-12', completedBlocks: [], unitId: null, reviewCount: 7 },
]

const units = [unit('unit-01', 'Begrüßung & Vorstellung')]

describe('Calendar', () => {
  it('zeigt den Monat des initialDate an und markiert Tage mit Aktivitaet', () => {
    render(
      <Calendar
        activity={activity}
        units={units}
        initialDate={new Date('2026-01-15T00:00:00Z')}
        onBack={vi.fn()}
        onOpenLesson={vi.fn()}
      />,
    )
    expect(screen.getByText(/Januar 2026/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^5$/ })).toHaveClass('has-activity')
  })

  it('zeigt beim Antippen eines Lerntags die Details inkl. Blöcke, Review-Anzahl und Lektion-Link', () => {
    render(
      <Calendar
        activity={activity}
        units={units}
        initialDate={new Date('2026-01-15T00:00:00Z')}
        onBack={vi.fn()}
        onOpenLesson={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /^5$/ }))

    expect(screen.getByText(/Begrüßung & Vorstellung/)).toBeInTheDocument()
    expect(screen.getByText(/Neuer Input/)).toBeInTheDocument()
    expect(screen.getByText(/Shadowing/)).toBeInTheDocument()
    expect(screen.getByText(/3 Vokabel-Wiederholung/)).toBeInTheDocument()
  })

  it('ruft onOpenLesson mit der richtigen unitId auf', () => {
    const onOpenLesson = vi.fn()
    render(
      <Calendar
        activity={activity}
        units={units}
        initialDate={new Date('2026-01-15T00:00:00Z')}
        onBack={vi.fn()}
        onOpenLesson={onOpenLesson}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /^5$/ }))
    fireEvent.click(screen.getByText(/Zur Lektion/))
    expect(onOpenLesson).toHaveBeenCalledWith('unit-01')
  })

  it('zeigt bei einem Tag ohne Unit keinen Lektion-Link, aber die Review-Anzahl', () => {
    render(
      <Calendar
        activity={activity}
        units={units}
        initialDate={new Date('2026-01-15T00:00:00Z')}
        onBack={vi.fn()}
        onOpenLesson={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /^12$/ }))
    expect(screen.queryByText(/Zur Lektion/)).not.toBeInTheDocument()
    expect(screen.getByText(/7 Vokabel-Wiederholung/)).toBeInTheDocument()
  })

  it('navigiert per Vor/Zurueck-Button zum naechsten/vorherigen Monat', () => {
    render(
      <Calendar
        activity={activity}
        units={units}
        initialDate={new Date('2026-01-15T00:00:00Z')}
        onBack={vi.fn()}
        onOpenLesson={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByLabelText('Nächster Monat'))
    expect(screen.getByText(/Februar 2026/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Vorheriger Monat'))
    fireEvent.click(screen.getByLabelText('Vorheriger Monat'))
    expect(screen.getByText(/Dezember 2025/)).toBeInTheDocument()
  })

  it('ruft onBack auf', () => {
    const onBack = vi.fn()
    render(
      <Calendar
        activity={activity}
        units={units}
        initialDate={new Date('2026-01-15T00:00:00Z')}
        onBack={onBack}
        onOpenLesson={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText(/Zurück/))
    expect(onBack).toHaveBeenCalled()
  })
})
