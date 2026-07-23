import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  vi.stubGlobal('speechSynthesis', undefined)
})

describe('App', () => {
  it('rendert nach dem Laden die Today-Uebersicht mit der ersten Unit', async () => {
    render(<App />)

    await waitFor(() => expect(screen.getByText('Français')).toBeInTheDocument())
    expect(screen.getByText(/Los geht's/)).toBeInTheDocument()
    expect(screen.getByText(/Streak/)).toBeInTheDocument()
  })
})
