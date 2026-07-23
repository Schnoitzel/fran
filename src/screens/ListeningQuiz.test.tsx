import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListeningQuiz } from './ListeningQuiz'

const quiz = {
  audioText: 'Bonjour',
  question: 'Was bedeutet das?',
  options: ['Hallo', 'Tschüss'],
  correctIndex: 0,
}

beforeEach(() => {
  vi.stubGlobal('speechSynthesis', undefined)
})

describe('ListeningQuiz', () => {
  it('markiert die richtige Antwort und aktiviert erst danach "Weiter"', () => {
    const onDone = vi.fn()
    render(<ListeningQuiz quiz={quiz} onDone={onDone} />)

    const weiterButton = screen.getByText('Weiter')
    expect(weiterButton).toBeDisabled()

    fireEvent.click(screen.getByText('Hallo'))
    expect(screen.getByText('✅ Richtig!')).toBeInTheDocument()
    expect(weiterButton).not.toBeDisabled()

    fireEvent.click(weiterButton)
    expect(onDone).toHaveBeenCalled()
  })

  it('zeigt die richtige Loesung an, wenn falsch geantwortet wurde', () => {
    render(<ListeningQuiz quiz={quiz} onDone={vi.fn()} />)
    fireEvent.click(screen.getByText('Tschüss'))
    expect(screen.getByText(/Nicht ganz/)).toBeInTheDocument()
  })
})
