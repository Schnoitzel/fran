import type { SessionBlockId } from '../planner/dailyPlan'
import { BLOCK_LABELS } from '../planner/blockLabels'

interface TodayProps {
  blocks: SessionBlockId[]
  streak: number
  dueCount: number
  unitTitle: string | null
  resuming: boolean
  onStart: () => void
  onSelectBlock: (index: number) => void
}

export function Today({
  blocks,
  streak,
  dueCount,
  unitTitle,
  resuming,
  onStart,
  onSelectBlock,
}: TodayProps) {
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
        {blocks.map((block, index) => (
          <li key={block}>
            <button className="block-list-item" onClick={() => onSelectBlock(index)}>
              {BLOCK_LABELS[block]}
              {block === 'vocab-review' && ` (${dueCount})`}
            </button>
          </li>
        ))}
      </ul>
      <button className="primary" onClick={onStart}>
        {resuming ? 'Weiter' : "Los geht's"}
      </button>
    </div>
  )
}
