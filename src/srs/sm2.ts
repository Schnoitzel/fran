/**
 * Vereinfachter SM-2-artiger Spaced-Repetition-Scheduler (Anki-Stil mit
 * 4 Bewertungsstufen statt der klassischen 0-5-Skala).
 */

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export interface CardScheduleState {
  easeFactor: number
  intervalDays: number
  reps: number
  lapses: number
  dueDate: number // epoch ms
}

const DAY_MS = 24 * 60 * 60 * 1000
const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

export function createNewCardState(now: number = Date.now()): CardScheduleState {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueDate: now,
  }
}

function clampEase(ease: number): number {
  return Math.max(MIN_EASE_FACTOR, ease)
}

export function schedule(
  card: CardScheduleState,
  rating: Rating,
  now: number = Date.now(),
): CardScheduleState {
  if (rating === 'again') {
    return {
      easeFactor: clampEase(card.easeFactor - 0.2),
      intervalDays: 0,
      reps: 0,
      lapses: card.lapses + 1,
      dueDate: now,
    }
  }

  const reps = card.reps + 1
  let easeFactor = card.easeFactor
  let intervalDays: number

  if (rating === 'hard') {
    easeFactor = clampEase(card.easeFactor - 0.15)
    intervalDays = reps === 1 ? 1 : Math.round(card.intervalDays * 1.2)
  } else if (rating === 'easy') {
    easeFactor = card.easeFactor + 0.15
    intervalDays = reps === 1 ? 4 : Math.round(card.intervalDays * easeFactor * 1.3)
  } else {
    // 'good'
    if (reps === 1) {
      intervalDays = 1
    } else if (reps === 2) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(card.intervalDays * easeFactor)
    }
  }

  intervalDays = Math.max(1, intervalDays)

  return {
    easeFactor,
    intervalDays,
    reps,
    lapses: card.lapses,
    dueDate: now + intervalDays * DAY_MS,
  }
}
