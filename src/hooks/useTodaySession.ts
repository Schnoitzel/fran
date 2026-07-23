import { useCallback, useEffect, useState } from 'react'
import type { Rating } from '../srs/sm2'
import { getDueCards, reviewCard } from '../db/cardsRepo'
import { recordSessionCompletion } from '../db/progressRepo'
import { ensureUnitStarted } from '../db/unitCardsService'
import type { CardRecord, FranDatabase, UnitStatus } from '../db/db'
import { buildTodayPlan, type SessionPlan } from '../planner/dailyPlan'
import type { Unit } from '../content/contentSchema'
import { todayDateString } from '../date'

export interface UseTodaySessionResult {
  loading: boolean
  plan: SessionPlan | null
  dueCards: CardRecord[]
  currentUnit: Unit | null
  blockIndex: number
  currentBlockId: SessionPlan['blocks'][number] | null
  streak: number
  rate: (cardId: number, rating: Rating) => Promise<void>
  startCurrentUnit: () => Promise<void>
  nextBlock: () => void
  goToBlock: (index: number) => void
  completeSession: () => Promise<void>
  reload: () => Promise<void>
}

export function useTodaySession(db: FranDatabase, units: Unit[]): UseTodaySessionResult {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<SessionPlan | null>(null)
  const [dueCards, setDueCards] = useState<CardRecord[]>([])
  const [blockIndex, setBlockIndex] = useState(0)
  const [streak, setStreak] = useState(0)

  const loadToday = useCallback(async () => {
    setLoading(true)
    const now = Date.now()

    const due = await getDueCards(db, now)
    const progressRecords = await db.unitProgress.toArray()
    const unitStatusById: Record<string, UnitStatus> = {}
    for (const p of progressRecords) unitStatusById[p.unitId] = p.status

    const nextPlan = buildTodayPlan({
      dueCardIds: due.map((c) => c.id as number),
      units,
      unitStatusById,
    })

    const sessions = await db.sessionLog.toArray()
    const lastStreak = sessions.length > 0 ? Math.max(...sessions.map((s) => s.streakCount)) : 0

    setDueCards(due)
    setPlan(nextPlan)
    setBlockIndex(0)
    setStreak(lastStreak)
    setLoading(false)
  }, [db, units])

  useEffect(() => {
    loadToday()
  }, [loadToday])

  const currentUnit = plan?.currentUnitId ? units.find((u) => u.id === plan.currentUnitId) ?? null : null
  const currentBlockId = plan?.blocks[blockIndex] ?? null

  const rate = useCallback(
    async (cardId: number, rating: Rating) => {
      await reviewCard(db, cardId, rating)
      setDueCards((prev) => prev.filter((c) => c.id !== cardId))
    },
    [db],
  )

  const startCurrentUnit = useCallback(async () => {
    if (!currentUnit) return
    await ensureUnitStarted(db, currentUnit)
  }, [db, currentUnit])

  const nextBlock = useCallback(() => {
    setBlockIndex((i) => i + 1)
  }, [])

  const goToBlock = useCallback(
    (index: number) => {
      const lastIndex = Math.max(0, (plan?.blocks.length ?? 1) - 1)
      setBlockIndex(Math.min(Math.max(0, index), lastIndex))
    },
    [plan],
  )

  const completeSession = useCallback(async () => {
    const completedBlocks = plan?.blocks ?? []
    const log = await recordSessionCompletion(db, todayDateString(), completedBlocks)
    setStreak(log.streakCount)
  }, [db, plan])

  return {
    loading,
    plan,
    dueCards,
    currentUnit,
    blockIndex,
    currentBlockId,
    streak,
    rate,
    startCurrentUnit,
    nextBlock,
    goToBlock,
    completeSession,
    reload: loadToday,
  }
}
