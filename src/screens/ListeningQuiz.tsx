import { useState } from 'react'
import type { Unit } from '../content/contentSchema'
import { speak } from '../speech/tts'

interface ListeningQuizProps {
  quiz: Unit['listeningQuiz']
  onDone: () => void
}

export function ListeningQuiz({ quiz, onDone }: ListeningQuizProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const isCorrect = selected !== null && selected === quiz.correctIndex

  return (
    <div className="screen">
      <h2>🎧 Hörverständnis</h2>
      <button className="primary" onClick={() => speak(quiz.audioText)}>
        🔊 Satz anhören
      </button>
      <p className="question">{quiz.question}</p>
      <div className="options">
        {quiz.options.map((option, i) => {
          const isSelected = selected === i
          const showCorrect = selected !== null && i === quiz.correctIndex
          return (
            <button
              key={option}
              onClick={() => setSelected(i)}
              className={
                isSelected ? (isSelected && i === quiz.correctIndex ? 'option correct' : 'option wrong') : showCorrect ? 'option correct' : 'option'
              }
            >
              {option}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <p className="feedback">{isCorrect ? '✅ Richtig!' : '❌ Nicht ganz — richtig wäre: ' + quiz.options[quiz.correctIndex]}</p>
      )}
      <button className="primary" disabled={selected === null} onClick={onDone}>
        Weiter
      </button>
    </div>
  )
}
