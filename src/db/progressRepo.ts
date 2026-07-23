import type { FranDatabase, SessionLogRecord, UnitProgressRecord, UnitStatus } from './db'

const DAY_MS = 24 * 60 * 60 * 1000

export async function setUnitStatus(
  db: FranDatabase,
  unitId: string,
  status: UnitStatus,
): Promise<void> {
  const existing = await db.unitProgress.get(unitId)
  const record: UnitProgressRecord = {
    unitId,
    status,
    introducedCardIds: existing?.introducedCardIds ?? [],
  }
  await db.unitProgress.put(record)
}

export async function getUnitProgress(
  db: FranDatabase,
  unitId: string,
): Promise<UnitProgressRecord> {
  const existing = await db.unitProgress.get(unitId)
  if (existing) return existing
  return { unitId, status: 'locked', introducedCardIds: [] }
}

function parseDateOnly(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getTime()
}

export async function recordSessionCompletion(
  db: FranDatabase,
  date: string,
  completedBlocks: string[],
  unitId: string | null = null,
): Promise<SessionLogRecord> {
  const allLogs = await db.sessionLog.toArray()
  const previousDate = new Date(parseDateOnly(date) - DAY_MS).toISOString().slice(0, 10)
  const previousLog = allLogs.find((log) => log.date === previousDate)

  const streakCount = previousLog ? previousLog.streakCount + 1 : 1

  const record: SessionLogRecord = { date, completedBlocks, streakCount, unitId }
  await db.sessionLog.put(record)
  return record
}

/**
 * Markiert eine Unit als abgeschlossen, sobald an ihr in einer Session
 * gearbeitet wurde (Lesson-Input + Listening + Shadowing durchlaufen).
 * Ermoeglicht dem Tagesplan, automatisch zur naechsten Unit weiterzugehen.
 */
export async function completeUnit(db: FranDatabase, unitId: string): Promise<void> {
  await setUnitStatus(db, unitId, 'done')
}
