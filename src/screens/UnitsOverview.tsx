import type { Unit } from '../content/contentSchema'
import type { UnitStatus } from '../db/db'

interface UnitsOverviewProps {
  units: Unit[]
  statusByUnitId: Record<string, UnitStatus>
  onSelect: (unitId: string) => void
  onBack: () => void
}

const STATUS_LABEL: Partial<Record<UnitStatus, string>> = {
  done: '✅ erledigt',
  in_progress: '📖 begonnen',
}

/**
 * Zeigt ALLE Units, unabhaengig von Locked/Progress-Status -- frei anwaehlbar,
 * damit man jederzeit zwischen Units hin- und herspringen kann (kein Gating,
 * Streak/Reihenfolge sind hier bewusst irrelevant).
 */
export function UnitsOverview({ units, statusByUnitId, onSelect, onBack }: UnitsOverviewProps) {
  return (
    <div className="screen">
      <button className="secondary" onClick={onBack}>
        ‹ Zurück
      </button>
      <h2>📚 Alle Units</h2>
      <ul className="block-list">
        {units.map((unit) => {
          const status = statusByUnitId[unit.id]
          const statusLabel = status ? STATUS_LABEL[status] : undefined
          return (
            <li key={unit.id}>
              <button className="block-list-item" onClick={() => onSelect(unit.id)}>
                <span className="unit-list-title">{unit.title}</span>
                {unit.level && <span className="unit-list-level"> · {unit.level}</span>}
                {statusLabel && <span className="unit-list-status"> · {statusLabel}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
