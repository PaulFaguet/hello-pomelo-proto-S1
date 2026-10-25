import { createSeedData } from './domain/seed'
import type { AppData } from './domain/types'

const STORAGE_KEY = 'feedback-prototype'
// À incrémenter dès que la forme des données change : les anciennes données sont alors remplacées par les données de départ.
const STORAGE_VERSION = 1

export interface PersistedState {
  version: number
  currentUserId: string
  data: AppData
}

export function initialState(): PersistedState {
  return { version: STORAGE_VERSION, currentUserId: 'lea', data: createSeedData() }
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState
      if (parsed.version === STORAGE_VERSION) return parsed
    }
  } catch {
    // Données illisibles : on repart des données de départ.
  }
  return initialState()
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Stockage indisponible (navigation privée…) : la démo fonctionne quand même, sans persistance.
  }
}
