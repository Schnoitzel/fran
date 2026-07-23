import { useState } from 'react'
import type { DailyActivity } from '../db/historyRepo'
import type { Unit } from '../content/contentSchema'
import { BLOCK_LABELS } from '../planner/blockLabels'
import type { SessionBlockId } from '../planner/dailyPlan'

interface CalendarProps {
  activity: DailyActivity[]
  units: Unit[]
  initialDate?: Date
  onBack: () => void
  onOpenLesson: (unitId: string) => void
}

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

function dateKey(year: number, monthIndex0: number, day: number): string {
  const mm = String(monthIndex0 + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate()
}

/**
 * Zeigt einen Monatskalender: Tage mit Lern-Aktivitaet sind markiert,
 * antippbar fuer ein Tagesdetail (bearbeitete Bloecke, Anzahl Vokabel-Reviews,
 * Sprung zurueck in die an dem Tag bearbeitete Lektion).
 */
export function Calendar({ activity, units, initialDate, onBack, onOpenLesson }: CalendarProps) {
  const ref = initialDate ?? new Date()
  const [year, setYear] = useState(ref.getUTCFullYear())
  const [monthIndex0, setMonthIndex0] = useState(ref.getUTCMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const activityByDate = new Map(activity.map((a) => [a.date, a]))
  const unitTitleById = new Map(units.map((u) => [u.id, u.title]))

  function goToMonth(delta: number) {
    let newMonth = monthIndex0 + delta
    let newYear = year
    if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    } else if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    }
    setMonthIndex0(newMonth)
    setYear(newYear)
    setSelectedDate(null)
  }

  const total = daysInMonth(year, monthIndex0)
  const days = Array.from({ length: total }, (_, i) => i + 1)
  const selected = selectedDate ? activityByDate.get(selectedDate) : undefined
  const selectedUnitId = selected?.unitId ?? null

  return (
    <div className="screen">
      <button className="secondary" onClick={onBack}>
        ‹ Zurück
      </button>
      <h2>🗓️ Verlauf</h2>
      <div className="calendar-header">
        <button aria-label="Vorheriger Monat" onClick={() => goToMonth(-1)}>
          ‹
        </button>
        <span className="calendar-month-label">
          {MONTH_NAMES[monthIndex0]} {year}
        </span>
        <button aria-label="Nächster Monat" onClick={() => goToMonth(1)}>
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const key = dateKey(year, monthIndex0, day)
          const hasActivity = activityByDate.has(key)
          return (
            <button
              key={key}
              className={hasActivity ? 'calendar-day has-activity' : 'calendar-day'}
              disabled={!hasActivity}
              onClick={() => setSelectedDate(key)}
            >
              {day}
            </button>
          )
        })}
      </div>
      {selected && (
        <div className="calendar-detail">
          <p className="calendar-detail-date">{selected.date}</p>
          {selected.unitId && (
            <p className="unit-title">{unitTitleById.get(selected.unitId) ?? selected.unitId}</p>
          )}
          {selected.completedBlocks.length > 0 && (
            <ul className="calendar-detail-blocks">
              {selected.completedBlocks.map((block, i) => (
                <li key={i}>{BLOCK_LABELS[block as SessionBlockId] ?? block}</li>
              ))}
            </ul>
          )}
          {selected.reviewCount > 0 && (
            <p>🔁 {selected.reviewCount} Vokabel-Wiederholung(en)</p>
          )}
          {selectedUnitId && (
            <button className="primary" onClick={() => onOpenLesson(selectedUnitId)}>
              Zur Lektion
            </button>
          )}
        </div>
      )}
    </div>
  )
}
