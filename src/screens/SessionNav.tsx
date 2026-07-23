import type { SessionBlockId } from '../planner/dailyPlan'
import { BLOCK_LABELS } from '../planner/blockLabels'

interface SessionNavProps {
  blocks: SessionBlockId[]
  currentIndex: number
  onJump: (index: number) => void
  onBackToOverview: () => void
}

export function SessionNav({ blocks, currentIndex, onJump, onBackToOverview }: SessionNavProps) {
  return (
    <div className="session-nav">
      <div className="session-nav-top">
        <button
          className="nav-back"
          disabled={currentIndex === 0}
          onClick={() => onJump(currentIndex - 1)}
        >
          ‹ Zurück
        </button>
        <button className="nav-overview" onClick={onBackToOverview}>
          Übersicht
        </button>
      </div>
      <div className="session-nav-blocks">
        {blocks.map((block, i) => (
          <button
            key={block}
            className={i === currentIndex ? 'nav-block active' : 'nav-block'}
            onClick={() => onJump(i)}
          >
            {BLOCK_LABELS[block]}
          </button>
        ))}
      </div>
    </div>
  )
}
