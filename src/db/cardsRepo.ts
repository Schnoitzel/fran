import { createNewCardState, schedule, type Rating } from '../srs/sm2'
import type { CardRecord, FranDatabase } from './db'

export interface NewCardInput {
  unitId: string
  front: string
  back: string
  ipaHint?: string
}

export async function addCard(
  db: FranDatabase,
  input: NewCardInput,
  now: number = Date.now(),
): Promise<number> {
  const record: CardRecord = {
    ...input,
    ...createNewCardState(now),
  }
  return db.cards.add(record)
}

export async function getDueCards(
  db: FranDatabase,
  now: number = Date.now(),
): Promise<CardRecord[]> {
  return db.cards.where('dueDate').belowOrEqual(now).sortBy('dueDate')
}

export async function reviewCard(
  db: FranDatabase,
  cardId: number,
  rating: Rating,
  now: number = Date.now(),
): Promise<CardRecord> {
  const card = await db.cards.get(cardId)
  if (!card) {
    throw new Error(`Karte ${cardId} existiert nicht`)
  }

  const nextState = schedule(card, rating, now)
  const updated: CardRecord = { ...card, ...nextState }

  await db.cards.put(updated)
  await db.reviewLog.add({ cardId, timestamp: now, rating })

  return updated
}
