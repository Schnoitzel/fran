import { useEffect, useState } from 'react'
import type { Unit } from '../content/contentSchema'
import { speak } from '../speech/tts'

interface ListeningQuizProps {
  quizzes: Unit['listeningQuizzes']
  onDone: () => void
}

export function ListeningQuiz({ quizzes, onDone }: ListeningQuizProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (quizzes.length === 0) onDone()
    // nur einmal beim Mount pruefen, analog zu Practice.tsx/Shadowing.tsx
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (quizzes.length === 0) return null

  const quiz = quizzes[index]
  const isLast = index === quizzes.length - 1
  const isCorrect = selected !== null && selected === quiz.correctIndex

  function handleNext() {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }

  return (
    <div className="screen">
      <h2>🎧 Hörverständnis</h2>
      {quizzes.length > 1 && (
        <p className="progress-hint">
          Frage {index + 1} von {quizzes.length}
        </p>
      )}
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
      <button className="primary" disabled={selected === null} onClick={handleNext}>
        {isLast ? 'Fertig' : 'Weiter'}
      </button>
    </div>
  )
}
