import { useEffect, useState } from 'react'
import { useTodaySession } from './hooks/useTodaySession'
import { db } from './db/dbInstance'
import { units } from './content/units'
import type { UnitStatus } from './db/db'
import { getDailyActivity, type DailyActivity } from './db/historyRepo'
import { Today } from './screens/Today'
import { VocabReview } from './screens/VocabReview'
import { LessonInput } from './screens/LessonInput'
import { ListeningQuiz } from './screens/ListeningQuiz'
import { Shadowing } from './screens/Shadowing'
import { Progress } from './screens/Progress'
import { Practice } from './screens/Practice'
import { UnitsOverview } from './screens/UnitsOverview'
import { UnitDetail } from './screens/UnitDetail'
import { Calendar } from './screens/Calendar'
import { SessionNav } from './screens/SessionNav'
import './App.css'

type View =
  | 'today'
  | 'session'
  | 'complete'
  | 'progress'
  | 'units'
  | 'unitDetail'
  | 'practiceVocab'
  | 'practiceListening'
  | 'practiceShadowing'
  | 'lessonView'
  | 'calendar'

const noop = async () => {}

export default function App() {
  const session = useTodaySession(db, units)
  const [view, setView] = useState<View>('today')
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [lessonOrigin, setLessonOrigin] = useState<'unitDetail' | 'calendar'>('unitDetail')
  const [unitStatusById, setUnitStatusById] = useState<Record<string, UnitStatus>>({})
  const [activity, setActivity] = useState<DailyActivity[]>([])

  useEffect(() => {
    if (view === 'units') {
      db.unitProgress.toArray().then((records) => {
        const byId: Record<string, UnitStatus> = {}
        for (const r of records) byId[r.unitId] = r.status
        setUnitStatusById(byId)
      })
    }
    if (view === 'calendar') {
      getDailyActivity(db).then(setActivity)
    }
  }, [view])

  if (session.loading) {
    return (
      <div className="screen">
        <p>Lade...</p>
      </div>
    )
  }

  const selectedUnit = selectedUnitId ? units.find((u) => u.id === selectedUnitId) ?? null : null

  const unitScopedViews: View[] = [
    'unitDetail',
    'lessonView',
    'practiceVocab',
    'practiceListening',
    'practiceShadowing',
  ]
  if (unitScopedViews.includes(view) && !selectedUnit) {
    return (
      <div className="screen">
        <p>Unit nicht gefunden.</p>
        <button className="primary" onClick={() => setView('units')}>
          Zur Unit-Übersicht
        </button>
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

  if (view === 'units') {
    return (
      <UnitsOverview
        units={units}
        statusByUnitId={unitStatusById}
        onSelect={(unitId) => {
          setSelectedUnitId(unitId)
          setView('unitDetail')
        }}
        onBack={() => setView('today')}
      />
    )
  }

  if (view === 'unitDetail' && selectedUnit) {
    return (
      <UnitDetail
        unit={selectedUnit}
        onBack={() => setView('units')}
        onLesson={() => {
          setLessonOrigin('unitDetail')
          setView('lessonView')
        }}
        onPracticeVocab={() => setView('practiceVocab')}
        onPracticeListening={() => setView('practiceListening')}
        onPracticeShadowing={() => setView('practiceShadowing')}
      />
    )
  }

  if (view === 'lessonView' && selectedUnit) {
    return (
      <LessonInput
        unit={selectedUnit}
        onStart={noop}
        readOnly
        doneLabel="Zurück"
        onDone={() => setView(lessonOrigin)}
      />
    )
  }

  if (view === 'practiceVocab' && selectedUnit) {
    return <Practice vocab={selectedUnit.vocab} onDone={() => setView('unitDetail')} />
  }

  if (view === 'practiceListening' && selectedUnit) {
    return (
      <ListeningQuiz quizzes={selectedUnit.listeningQuizzes} onDone={() => setView('unitDetail')} />
    )
  }

  if (view === 'practiceShadowing' && selectedUnit) {
    return (
      <Shadowing sentences={selectedUnit.shadowingSentences} onDone={() => setView('unitDetail')} />
    )
  }

  if (view === 'calendar') {
    return (
      <Calendar
        activity={activity}
        units={units}
        onBack={() => setView('today')}
        onOpenLesson={(unitId) => {
          setSelectedUnitId(unitId)
          setLessonOrigin('calendar')
          setView('lessonView')
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
          <button onClick={() => setView('units')}>📚 Units</button>
          <button onClick={() => setView('calendar')}>🗓️ Verlauf</button>
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
        <ListeningQuiz quizzes={session.currentUnit.listeningQuizzes} onDone={handleBlockDone} />
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
