import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SessionNav } from './SessionNav'
import type { SessionBlockId } from '../planner/dailyPlan'

const blocks: SessionBlockId[] = ['vocab-review', 'lesson-input', 'listening-quiz', 'shadowing']

describe('SessionNav', () => {
  it('rendert einen Button pro Block und markiert den aktuellen', () => {
    render(<SessionNav blocks={blocks} currentIndex={1} onJump={vi.fn()} onBackToOverview={vi.fn()} />)
    const current = screen.getByRole('button', { name: /Neuer Input/ })
    expect(current.className).toContain('active')
  })

  it('ruft onJump mit dem Index auf, wenn ein anderer Block angetippt wird', () => {
    const onJump = vi.fn()
    render(<SessionNav blocks={blocks} currentIndex={0} onJump={onJump} onBackToOverview={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Shadowing/ }))
    expect(onJump).toHaveBeenCalledWith(3)
  })

  it('ruft onBackToOverview auf, wenn "Übersicht" angetippt wird', () => {
    const onBack = vi.fn()
    render(<SessionNav blocks={blocks} currentIndex={0} onJump={vi.fn()} onBackToOverview={onBack} />)
    fireEvent.click(screen.getByText(/Übersicht/))
    expect(onBack).toHaveBeenCalled()
  })

  it('zeigt einen "Zurück"-Button, der zum vorherigen Block springt, deaktiviert beim ersten Block', () => {
    const onJump = vi.fn()
    const { rerender } = render(
      <SessionNav blocks={blocks} currentIndex={0} onJump={onJump} onBackToOverview={vi.fn()} />,
    )
    expect(screen.getByText('‹ Zurück')).toBeDisabled()

    rerender(<SessionNav blocks={blocks} currentIndex={2} onJump={onJump} onBackToOverview={vi.fn()} />)
    fireEvent.click(screen.getByText('‹ Zurück'))
    expect(onJump).toHaveBeenCalledWith(1)
  })
})
