import type {
  CardRecord,
  FranDatabase,
  ReviewLogRecord,
  SessionLogRecord,
  UnitProgressRecord,
} from './db'

interface BackupPayload {
  version: 1
  exportedAt: number
  cards: CardRecord[]
  reviewLog: ReviewLogRecord[]
  unitProgress: UnitProgressRecord[]
  sessionLog: SessionLogRecord[]
}

/** Exportiert den gesamten lokalen Lernstand als JSON-String (Backup gegen
 * iOS-Safari-Speicherbereinigung). */
export async function exportBackup(db: FranDatabase): Promise<string> {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: Date.now(),
    cards: await db.cards.toArray(),
    reviewLog: await db.reviewLog.toArray(),
    unitProgress: await db.unitProgress.toArray(),
    sessionLog: await db.sessionLog.toArray(),
  }
  return JSON.stringify(payload, null, 2)
}

/** Importiert ein Backup und ersetzt dabei den kompletten Inhalt der
 * Ziel-DB (kein Anhaengen an bestehende Daten). */
export async function importBackup(db: FranDatabase, json: string): Promise<void> {
  let payload: BackupPayload
  try {
    payload = JSON.parse(json)
  } catch (err) {
    throw new Error(`Backup-Datei ist kein gueltiges JSON: ${(err as Error).message}`)
  }

  if (!payload || payload.version !== 1) {
    throw new Error('Unbekanntes oder fehlendes Backup-Format (version !== 1)')
  }

  await db.transaction(
    'rw',
    [db.cards, db.reviewLog, db.unitProgress, db.sessionLog],
    async () => {
      await db.cards.clear()
      await db.reviewLog.clear()
      await db.unitProgress.clear()
      await db.sessionLog.clear()

      await db.cards.bulkAdd(payload.cards)
      await db.reviewLog.bulkAdd(payload.reviewLog)
      await db.unitProgress.bulkAdd(payload.unitProgress)
      await db.sessionLog.bulkAdd(payload.sessionLog)
    },
  )
}
