import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Practice } from './Practice'

const vocab = [
  { front: 'bonjour', back: 'hallo' },
  { front: 'merci', back: 'danke' },
]

describe('Practice (freier Vokabel-Uebungsmodus)', () => {
  it('zeigt die erste Karte verdeckt an und deckt sie beim Antippen auf', () => {
    render(<Practice vocab={vocab} onDone={vi.fn()} shuffle={(v) => v} />)

    expect(screen.getByText('bonjour')).toBeInTheDocument()
    expect(screen.queryByText('hallo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('bonjour'))
    expect(screen.getByText('hallo')).toBeInTheDocument()
  })

  it('geht durch alle Karten und ruft am Ende onDone auf', () => {
    const onDone = vi.fn()
    render(<Practice vocab={vocab} onDone={onDone} shuffle={(v) => v} />)

    fireEvent.click(screen.getByText('bonjour'))
    fireEvent.click(screen.getByText('Weiter'))

    expect(screen.getByText('merci')).toBeInTheDocument()
    fireEvent.click(screen.getByText('merci'))
    expect(onDone).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Fertig'))
    expect(onDone).toHaveBeenCalled()
  })

  it('schreibt keine Bewertungs-Buttons (kein SRS-Einfluss im Uebungsmodus)', () => {
    render(<Practice vocab={vocab} onDone={vi.fn()} shuffle={(v) => v} />)
    fireEvent.click(screen.getByText('bonjour'))
    expect(screen.queryByText(/Vergessen/)).not.toBeInTheDocument()
  })

  it('ruft onDone sofort auf, wenn keine Vokabeln vorhanden sind', () => {
    const onDone = vi.fn()
    render(<Practice vocab={[]} onDone={onDone} />)
    expect(onDone).toHaveBeenCalled()
  })
})
