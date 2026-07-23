import type { Unit } from '../content/contentSchema'

interface UnitDetailProps {
  unit: Unit
  onBack: () => void
  onLesson: () => void
  onPracticeVocab: () => void
  onPracticeListening: () => void
  onPracticeShadowing: () => void
}

/**
 * Aktionen fuer eine frei angewaehlte Unit -- unabhaengig vom Tagesplan.
 * "Lektion ansehen" oeffnet die Lektion read-only (kein SRS-Einfluss),
 * die drei "üben"-Aktionen starten den freien Uebungsmodus.
 */
export function UnitDetail({
  unit,
  onBack,
  onLesson,
  onPracticeVocab,
  onPracticeListening,
  onPracticeShadowing,
}: UnitDetailProps) {
  return (
    <div className="screen">
      <button className="secondary" onClick={onBack}>
        ‹ Zurück
      </button>
      <h2>{unit.title}</h2>
      {unit.level && <p className="unit-title">{unit.level} · {unit.cefrTopic}</p>}
      <ul className="block-list">
        <li>
          <button className="block-list-item" onClick={onLesson}>
            📖 Lektion ansehen
          </button>
        </li>
        <li>
          <button className="block-list-item" onClick={onPracticeVocab}>
            🔁 Vokabeln üben
          </button>
        </li>
        <li>
          <button className="block-list-item" onClick={onPracticeListening}>
            🎧 Hörverständnis üben
          </button>
        </li>
        <li>
          <button className="block-list-item" onClick={onPracticeShadowing}>
            🗣️ Shadowing üben
          </button>
        </li>
      </ul>
    </div>
  )
}
