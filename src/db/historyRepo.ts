import type { FranDatabase, ReviewLogRecord, SessionLogRecord } from './db'

export interface DailyActivity {
  date: string // YYYY-MM-DD
  completedBlocks: string[]
  unitId: string | null
  reviewCount: number
}

function dateOf(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

/**
 * Baut eine pro-Tag-Aktivitaetsuebersicht aus sessionLog + reviewLog, absteigend
 * nach Datum sortiert (neueste zuerst). Tage koennen sowohl aus einer
 * abgeschlossenen Tagessession stammen als auch nur aus freien
 * Vokabel-Reviews (ohne offizielle Session), z. B. aus dem Uebungsmodus.
 */
export function buildDailyActivity(
  sessionLogs: SessionLogRecord[],
  reviewLogs: ReviewLogRecord[],
): DailyActivity[] {
  const byDate = new Map<string, DailyActivity>()

  const getOrCreate = (date: string): DailyActivity => {
    let entry = byDate.get(date)
    if (!entry) {
      entry = { date, completedBlocks: [], unitId: null, reviewCount: 0 }
      byDate.set(date, entry)
    }
    return entry
  }

  for (const log of sessionLogs) {
    const entry = getOrCreate(log.date)
    entry.completedBlocks = log.completedBlocks
    entry.unitId = log.unitId ?? null
  }

  for (const review of reviewLogs) {
    const entry = getOrCreate(dateOf(review.timestamp))
    entry.reviewCount += 1
  }

  return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export async function getDailyActivity(db: FranDatabase): Promise<DailyActivity[]> {
  const [sessionLogs, reviewLogs] = await Promise.all([
    db.sessionLog.toArray(),
    db.reviewLog.toArray(),
  ])
  return buildDailyActivity(sessionLogs, reviewLogs)
}
