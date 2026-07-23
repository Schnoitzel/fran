import type { SessionBlockId } from '../planner/dailyPlan'

const BLOCK_LABELS: Record<SessionBlockId, string> = {
  'vocab-review': '🔁 Vokabel-Wiederholung',
  'lesson-input': '📖 Neuer Input',
  'listening-quiz': '🎧 Hörverständnis',
  shadowing: '🗣️ Shadowing',
}

interface TodayProps {
  blocks: SessionBlockId[]
  streak: number
  dueCount: number
  unitTitle: string | null
  onStart: () => void
}

export function Today({ blocks, streak, dueCount, unitTitle, onStart }: TodayProps) {
  if (blocks.length === 0) {
    return (
      <div className="screen">
        <h1>Français</h1>
        <p className="streak">🔥 {streak} Tage Streak</p>
        <p>Für heute ist nichts fällig — gut gemacht! 🎉</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <h1>Français</h1>
      <p className="streak">🔥 {streak} Tage Streak</p>
      {unitTitle && <p className="unit-title">Heute: {unitTitle}</p>}
      <ul className="block-list">
        {blocks.map((block) => (
          <li key={block}>
            {BLOCK_LABELS[block]}
            {block === 'vocab-review' && ` (${dueCount})`}
          </li>
        ))}
      </ul>
      <button className="primary" onClick={onStart}>
        Los geht's
      </button>
    </div>
  )
}
