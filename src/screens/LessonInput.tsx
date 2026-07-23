import { useEffect } from 'react'
import type { Unit } from '../content/contentSchema'
import { speak } from '../speech/tts'

interface LessonInputProps {
  unit: Unit
  onStart: () => Promise<void>
  onDone: () => void
}

export function LessonInput({ unit, onStart, onDone }: LessonInputProps) {
  useEffect(() => {
    onStart()
    // onStart ist idempotent (ensureUnitStarted) - bewusst nur beim Mount pro Unit ausfuehren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id])

  return (
    <div className="screen">
      <h2>{unit.title}</h2>
      {unit.grammarNote && (
        <div className="grammar-note">
          <strong>💡 Kurz erklärt:</strong> {unit.grammarNote}
        </div>
      )}
      <div className="dialogue">
        {unit.dialogue.map((line, i) => (
          <div key={i} className="dialogue-line">
            <span className="speaker">{line.speaker}:</span>
            <span className="fr">{line.fr}</span>
            <button className="tts-btn" onClick={() => speak(line.fr)} aria-label="Anhören">
              🔊
            </button>
            <div className="de">{line.de}</div>
          </div>
        ))}
      </div>
      <button className="primary" onClick={onDone}>
        Weiter
      </button>
    </div>
  )
}
