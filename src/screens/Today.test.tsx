import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Today } from './Today'
import type { SessionBlockId } from '../planner/dailyPlan'

const blocks: SessionBlockId[] = ['vocab-review', 'lesson-input', 'listening-quiz', 'shadowing']

describe('Today', () => {
  it('ruft onSelectBlock mit dem passenden Index auf, wenn ein Block in der Uebersicht angetippt wird', () => {
    const onSelectBlock = vi.fn()
    render(
      <Today
        blocks={blocks}
        streak={0}
        dueCount={3}
        unitTitle="Begrüßung"
        resuming={false}
        onStart={vi.fn()}
        onSelectBlock={onSelectBlock}
      />,
    )

    fireEvent.click(screen.getByText(/Hörverständnis/))
    expect(onSelectBlock).toHaveBeenCalledWith(2)
  })

  it('zeigt die faellige Kartenzahl beim vocab-review-Block an', () => {
    render(
      <Today
        blocks={blocks}
        streak={0}
        dueCount={5}
        unitTitle={null}
        resuming={false}
        onStart={vi.fn()}
        onSelectBlock={vi.fn()}
      />,
    )
    expect(screen.getByText(/Vokabel-Wiederholung \(5\)/)).toBeInTheDocument()
  })

  it('zeigt keine Blockliste, wenn nichts zu tun ist', () => {
    render(
      <Today
        blocks={[]}
        streak={2}
        dueCount={0}
        unitTitle={null}
        resuming={false}
        onStart={vi.fn()}
        onSelectBlock={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
