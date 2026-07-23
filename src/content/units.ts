import { parseUnits, type Unit } from './contentSchema'

const modules = import.meta.glob('./units/*.json', { eager: true }) as Record<
  string,
  { default: unknown }
>

export const units: Unit[] = parseUnits(
  Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([, mod]) => mod.default),
)
