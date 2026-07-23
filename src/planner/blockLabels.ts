import type { SessionBlockId } from './dailyPlan'

export const BLOCK_LABELS: Record<SessionBlockId, string> = {
  'vocab-review': '🔁 Vokabel-Wiederholung',
  'lesson-input': '📖 Neuer Input',
  'listening-quiz': '🎧 Hörverständnis',
  shadowing: '🗣️ Shadowing',
}

export const BLOCK_SHORT_LABELS: Record<SessionBlockId, string> = {
  'vocab-review': '🔁',
  'lesson-input': '📖',
  'listening-quiz': '🎧',
  shadowing: '🗣️',
}
