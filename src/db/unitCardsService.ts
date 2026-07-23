import type { Unit } from '../content/contentSchema'
import { addCard } from './cardsRepo'
import type { FranDatabase, UnitProgressRecord } from './db'

/**
 * Stellt sicher, dass eine Unit "gestartet" ist: Vokabeln werden beim
 * allerersten Aufruf als Karten angelegt, Status springt auf 'in_progress'
 * (ausser die Unit ist bereits 'done'). Wiederholte Aufrufe sind sicher
 * (keine doppelten Karten).
 */
export async function ensureUnitStarted(
  db: FranDatabase,
  unit: Unit,
  now: number = Date.now(),
): Promise<UnitProgressRecord> {
  const existing = await db.unitProgress.get(unit.id)

  if (existing && existing.introducedCardIds.length > 0) {
    return existing
  }

  const cardIds = await Promise.all(
    unit.vocab.map((v) =>
      addCard(db, { unitId: unit.id, front: v.front, back: v.back, ipaHint: v.ipaHint }, now),
    ),
  )

  const status = existing?.status === 'done' ? 'done' : 'in_progress'

  const record: UnitProgressRecord = {
    unitId: unit.id,
    status,
    introducedCardIds: cardIds,
  }
  await db.unitProgress.put(record)
  return record
}
