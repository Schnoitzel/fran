import Dexie, { type Table } from 'dexie'
import type { CardScheduleState } from '../srs/sm2'

export interface CardRecord extends CardScheduleState {
  id?: number
  unitId: string
  front: string
  back: string
  ipaHint?: string
}

export interface ReviewLogRecord {
  id?: number
  cardId: number
  timestamp: number
  rating: string
}

export type UnitStatus = 'locked' | 'available' | 'in_progress' | 'done'

export interface UnitProgressRecord {
  unitId: string
  status: UnitStatus
  introducedCardIds: number[]
}

export interface SessionLogRecord {
  date: string // YYYY-MM-DD
  completedBlocks: string[]
  streakCount: number
  unitId?: string | null
}

export class FranDatabase extends Dexie {
  cards!: Table<CardRecord, number>
  reviewLog!: Table<ReviewLogRecord, number>
  unitProgress!: Table<UnitProgressRecord, string>
  sessionLog!: Table<SessionLogRecord, string>

  constructor(name = 'fran-db') {
    super(name)
    this.version(1).stores({
      cards: '++id, unitId, dueDate',
      reviewLog: '++id, cardId, timestamp',
      unitProgress: 'unitId',
      sessionLog: 'date',
    })
    // v2: sessionLog bekommt optional unitId (fuer Kalender-Sprung zurueck in die
    // an diesem Tag bearbeitete Lektion). Keine Indexaenderung noetig, daher kein
    // gesonderter upgrade()-Handler noetig -- fehlende Werte sind einfach undefined.
    this.version(2).stores({
      cards: '++id, unitId, dueDate',
      reviewLog: '++id, cardId, timestamp',
      unitProgress: 'unitId',
      sessionLog: 'date',
    })
  }
}
