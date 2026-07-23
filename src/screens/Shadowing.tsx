import { useState } from 'react'
import { speak } from '../speech/tts'

interface ShadowingProps {
  sentences: string[]
  onDone: () => void
}

export function Shadowing({ sentences, onDone }: ShadowingProps) {
  const [index, setIndex] = useState(0)

  if (sentences.length === 0) {
    onDone()
    return null
  }

  const isLast = index === sentences.length - 1

  function handleNext() {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="screen">
      <h2>🗣️ Shadowing</h2>
      <p className="progress-hint">
        Satz {index + 1} von {sentences.length}
      </p>
      <p className="shadow-sentence">{sentences[index]}</p>
      <button className="primary" onClick={() => speak(sentences[index], { rate: 0.9 })}>
        🔊 Abspielen
      </button>
      <p className="hint">Jetzt laut nachsprechen.</p>
      <button className="secondary" onClick={handleNext}>
        {isLast ? 'Fertig' : 'Weiter'}
      </button>
    </div>
  )
}
