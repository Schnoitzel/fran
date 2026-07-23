import type { Unit } from '../content/contentSchema'
import type { UnitStatus } from '../db/db'

export type SessionBlockId = 'vocab-review' | 'lesson-input' | 'listening-quiz' | 'shadowing'

export interface SessionPlan {
  blocks: SessionBlockId[]
  dueCardIds: number[]
  currentUnitId: string | null
}

export interface BuildTodayPlanInput {
  dueCardIds: number[]
  units: Unit[]
  unitStatusById: Record<string, UnitStatus>
}

/**
 * Bestimmt den heutigen ~30-Minuten-Lernplan aus faelligen Vokabel-Reviews
 * und der naechsten offenen Unit. Reihenfolge der Unit-Auswahl:
 * in_progress > available > locked (naechste in Reihenfolge, auto-progress)
 * > done wird uebersprungen.
 */
export function buildTodayPlan(input: BuildTodayPlanInput): SessionPlan {
  const { dueCardIds, units, unitStatusById } = input

  const statusOf = (unitId: string): UnitStatus => unitStatusById[unitId] ?? 'locked'

  const currentUnit =
    units.find((u) => statusOf(u.id) === 'in_progress') ??
    units.find((u) => statusOf(u.id) === 'available') ??
    units.find((u) => statusOf(u.id) === 'locked') ??
    null

  const blocks: SessionBlockId[] = []
  if (dueCardIds.length > 0) {
    blocks.push('vocab-review')
  }
  if (currentUnit) {
    blocks.push('lesson-input', 'listening-quiz', 'shadowing')
  }

  return {
    blocks,
    dueCardIds,
    currentUnitId: currentUnit?.id ?? null,
  }
}
