import { SaveData } from '../data/types'

export const SAVE_KEY = 'td.save.v1'
const CURRENT_VERSION = 1

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.version !== CURRENT_VERSION) return null
    return data
  } catch (e) {
    console.warn('Failed to load save', e)
    return null
  }
}

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save game', e)
  }
}
