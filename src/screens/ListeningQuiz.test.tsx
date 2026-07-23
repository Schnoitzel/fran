import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListeningQuiz } from './ListeningQuiz'

const singleQuiz = [
  {
    audioText: 'Bonjour',
    question: 'Was bedeutet das?',
    options: ['Hallo', 'Tschüss'],
    correctIndex: 0,
  },
]

const twoQuizzes = [
  ...singleQuiz,
  {
    audioText: 'Au revoir',
    question: 'Was bedeutet das?',
    options: ['Auf Wiedersehen', 'Danke'],
    correctIndex: 0,
  },
]

beforeEach(() => {
  vi.stubGlobal('speechSynthesis', undefined)
})

describe('ListeningQuiz', () => {
  it('markiert die richtige Antwort und aktiviert erst danach den Weiter-Button', () => {
    const onDone = vi.fn()
    render(<ListeningQuiz quizzes={singleQuiz} onDone={onDone} />)

    const weiterButton = screen.getByText('Fertig')
    expect(weiterButton).toBeDisabled()

    fireEvent.click(screen.getByText('Hallo'))
    expect(screen.getByText('✅ Richtig!')).toBeInTheDocument()
    expect(weiterButton).not.toBeDisabled()

    fireEvent.click(weiterButton)
    expect(onDone).toHaveBeenCalled()
  })

  it('zeigt die richtige Loesung an, wenn falsch geantwortet wurde', () => {
    render(<ListeningQuiz quizzes={singleQuiz} onDone={vi.fn()} />)
    fireEvent.click(screen.getByText('Tschüss'))
    expect(screen.getByText(/Nicht ganz/)).toBeInTheDocument()
  })

  it('geht bei mehreren Fragen erst zur naechsten, bevor onDone aufgerufen wird', () => {
    const onDone = vi.fn()
    render(<ListeningQuiz quizzes={twoQuizzes} onDone={onDone} />)

    expect(screen.getByText('Frage 1 von 2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hallo'))
    fireEvent.click(screen.getByText('Weiter'))

    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByText('Frage 2 von 2')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Auf Wiedersehen'))
    fireEvent.click(screen.getByText('Fertig'))
    expect(onDone).toHaveBeenCalled()
  })
})
