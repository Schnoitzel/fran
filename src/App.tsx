import { useState } from 'react'
import { useTodaySession } from './hooks/useTodaySession'
import { db } from './db/dbInstance'
import { units } from './content/units'
import { Today } from './screens/Today'
import { VocabReview } from './screens/VocabReview'
import { LessonInput } from './screens/LessonInput'
import { ListeningQuiz } from './screens/ListeningQuiz'
import { Shadowing } from './screens/Shadowing'
import { Progress } from './screens/Progress'
import { SessionNav } from './screens/SessionNav'
import './App.css'

type View = 'today' | 'session' | 'complete' | 'progress'

export default function App() {
  const session = useTodaySession(db, units)
  const [view, setView] = useState<View>('today')

  if (session.loading) {
    return (
      <div className="screen">
        <p>Lade...</p>
      </div>
    )
  }

  if (view === 'progress') {
    return (
      <Progress
        streak={session.streak}
        onBack={() => setView('today')}
        onImported={() => {
          session.reload()
          setView('today')
        }}
      />
    )
  }

  if (view === 'complete') {
    return (
      <div className="screen">
        <h2>🎉 Session abgeschlossen!</h2>
        <p className="streak">🔥 {session.streak} Tage Streak</p>
        <button className="primary" onClick={() => setView('today')}>
          Zur Übersicht
        </button>
      </div>
    )
  }

  if (view === 'today') {
    return (
      <>
        <Today
          blocks={session.plan?.blocks ?? []}
          streak={session.streak}
          dueCount={session.dueCards.length}
          unitTitle={session.currentUnit?.title ?? null}
          resuming={session.blockIndex > 0}
          onStart={() => setView('session')}
          onSelectBlock={(index) => {
            session.goToBlock(index)
            setView('session')
          }}
        />
        <nav className="bottom-nav">
          <button onClick={() => setView('progress')}>📊 Fortschritt</button>
        </nav>
      </>
    )
  }

  // view === 'session'
  const blockId = session.currentBlockId
  const isLastBlock = session.plan ? session.blockIndex === session.plan.blocks.length - 1 : true

  async function handleBlockDone() {
    if (isLastBlock) {
      await session.completeSession()
      setView('complete')
    } else {
      session.nextBlock()
    }
  }

  const nav = session.plan && session.plan.blocks.length > 0 && (
    <SessionNav
      blocks={session.plan.blocks}
      currentIndex={session.blockIndex}
      onJump={session.goToBlock}
      onBackToOverview={() => setView('today')}
    />
  )

  if (blockId === 'vocab-review') {
    return (
      <>
        {nav}
        <VocabReview cards={session.dueCards} onRate={session.rate} onDone={handleBlockDone} />
      </>
    )
  }
  if (blockId === 'lesson-input' && session.currentUnit) {
    return (
      <>
        {nav}
        <LessonInput
          unit={session.currentUnit}
          onStart={session.startCurrentUnit}
          onDone={handleBlockDone}
        />
      </>
    )
  }
  if (blockId === 'listening-quiz' && session.currentUnit) {
    return (
      <>
        {nav}
        <ListeningQuiz quiz={session.currentUnit.listeningQuiz} onDone={handleBlockDone} />
      </>
    )
  }
  if (blockId === 'shadowing' && session.currentUnit) {
    return (
      <>
        {nav}
        <Shadowing sentences={session.currentUnit.shadowingSentences} onDone={handleBlockDone} />
      </>
    )
  }

  return (
    <div className="screen">
      <p>Nichts mehr zu tun für heute.</p>
      <button className="primary" onClick={() => setView('today')}>
        Zur Übersicht
      </button>
    </div>
  )
}
