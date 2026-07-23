import { useEffect } from 'react'
import type { Unit } from '../content/contentSchema'
import { speak } from '../speech/tts'

interface LessonInputProps {
  unit: Unit
  onStart: () => Promise<void>
  onDone: () => void
  readOnly?: boolean
  doneLabel?: string
}

export function LessonInput({
  unit,
  onStart,
  onDone,
  readOnly = false,
  doneLabel = 'Weiter',
}: LessonInputProps) {
  useEffect(() => {
    if (readOnly) return
    onStart()
    // onStart ist idempotent (ensureUnitStarted) - bewusst nur beim Mount pro Unit ausfuehren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id, readOnly])

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
      {unit.culture && unit.culture.length > 0 && (
        <div className="culture-notes">
          <h3>🎭 Kultur, Redewendungen &amp; Humor</h3>
          {unit.culture.map((note, i) => (
            <div key={i} className="culture-note">
              <strong>{note.title}</strong>
              <p>{note.text}</p>
            </div>
          ))}
        </div>
      )}
      <button className="primary" onClick={onDone}>
        {doneLabel}
      </button>
    </div>
  )
}
