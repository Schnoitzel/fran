import { useEffect, useState } from 'react'
import type { CardRecord } from '../db/db'
import type { Rating } from '../srs/sm2'

interface VocabReviewProps {
  cards: CardRecord[]
  onRate: (cardId: number, rating: Rating) => Promise<void>
  onDone: () => void
}

const RATING_BUTTONS: { rating: Rating; label: string }[] = [
  { rating: 'again', label: '❌ Vergessen' },
  { rating: 'hard', label: '😓 Schwer' },
  { rating: 'good', label: '🙂 Gut' },
  { rating: 'easy', label: '😎 Einfach' },
]

export function VocabReview({ cards, onRate, onDone }: VocabReviewProps) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (cards.length === 0) onDone()
  }, [cards.length, onDone])

  if (cards.length === 0) return null

  const current = cards[0]

  async function handleRate(rating: Rating) {
    setRevealed(false)
    await onRate(current.id as number, rating)
  }

  return (
    <div className="screen">
      <p className="progress-hint">Noch {cards.length} Karte(n)</p>
      <div className="flashcard" onClick={() => setRevealed(true)}>
        <p className="flashcard-front">{current.front}</p>
        {revealed && <p className="flashcard-back">{current.back}</p>}
        {!revealed && <p className="hint">(antippen zum Aufdecken)</p>}
      </div>
      {revealed && (
        <div className="rating-buttons">
          {RATING_BUTTONS.map(({ rating, label }) => (
            <button key={rating} onClick={() => handleRate(rating)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
