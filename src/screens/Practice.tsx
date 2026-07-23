import { useEffect, useRef, useState } from 'react'
import type { Unit } from '../content/contentSchema'

function defaultShuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

interface PracticeProps {
  vocab: Unit['vocab']
  onDone: () => void
  shuffle?: <T>(items: T[]) => T[]
}

/**
 * Freier Uebungsmodus: fragt die Vokabeln einer Unit in zufaelliger
 * Reihenfolge ab, rein zum Wiederholen -- ohne SRS-Bewertung und ohne
 * DB-Schreibzugriffe. Kann jederzeit fuer jede Unit gestartet werden.
 */
export function Practice({ vocab, onDone, shuffle = defaultShuffle }: PracticeProps) {
  const shuffledRef = useRef<Unit['vocab'] | null>(null)
  if (shuffledRef.current === null) {
    shuffledRef.current = shuffle(vocab)
  }
  const cards = shuffledRef.current

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (cards.length === 0) onDone()
    // nur einmal beim Mount pruefen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (cards.length === 0) return null

  const current = cards[index]
  const isLast = index === cards.length - 1

  function handleNext() {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
      setRevealed(false)
    }
  }

  return (
    <div className="screen">
      <h2>🔁 Vokabeln üben</h2>
      <p className="progress-hint">
        Karte {index + 1} von {cards.length}
      </p>
      <div className="flashcard" onClick={() => setRevealed(true)}>
        <p className="flashcard-front">{current.front}</p>
        {revealed && <p className="flashcard-back">{current.back}</p>}
        {!revealed && <p className="hint">(antippen zum Aufdecken)</p>}
      </div>
      <button className="primary" disabled={!revealed} onClick={handleNext}>
        {isLast ? 'Fertig' : 'Weiter'}
      </button>
    </div>
  )
}
