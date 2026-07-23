import { FranDatabase } from './db'

/** Produktions-Singleton der lokalen Datenbank (IndexedDB via Dexie). */
export const db = new FranDatabase('fran-db')
