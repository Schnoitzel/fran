export function todayDateString(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}
