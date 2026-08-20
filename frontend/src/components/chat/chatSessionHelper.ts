import { ScreeningRecord, ScreeningSubmitResponse } from '../../types/screening'
import { ChatMode } from './ChatDrawerContext'

export interface ActiveSessionResult {
  mode: ChatMode
  record: ScreeningRecord | null
}

export const DISMISS_STORAGE_KEY_UMUM = 'sehati_chat_teaser_dismissed_umum'
export const DISMISS_STORAGE_KEY_PERSONAL = 'sehati_chat_teaser_dismissed_personal'

/**
 * Safely parse and retrieve the active screening session from sessionStorage.
 * Always wrapped in defensive try/catch to prevent corrupted data from crashing the app.
 */
export function getActiveScreeningSession(): ActiveSessionResult {
  try {
    const cached = sessionStorage.getItem('sehati_active_screening')
    if (cached) {
      const parsed: ScreeningSubmitResponse = JSON.parse(cached)
      if (parsed && typeof parsed === 'object' && parsed.data?.sessionId) {
        return {
          mode: 'personal',
          record: parsed.data,
        }
      }
    }
  } catch (err) {
    console.warn('[SEHATI Chat] Failed to parse active screening session safely, fallback to mode umum:', err)
  }

  return {
    mode: 'umum',
    record: null,
  }
}

/**
 * Check if the teaser bubble for the given mode has been dismissed in the current session.
 */
export function isTeaserDismissedForMode(mode: ChatMode): boolean {
  try {
    const key = mode === 'personal' ? DISMISS_STORAGE_KEY_PERSONAL : DISMISS_STORAGE_KEY_UMUM
    return sessionStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

/**
 * Mark the teaser bubble for the given mode as dismissed in sessionStorage.
 */
export function setTeaserDismissedForMode(mode: ChatMode): void {
  try {
    const key = mode === 'personal' ? DISMISS_STORAGE_KEY_PERSONAL : DISMISS_STORAGE_KEY_UMUM
    sessionStorage.setItem(key, 'true')
  } catch (err) {
    console.warn('[SEHATI Chat] Failed to set teaser dismiss flag in sessionStorage:', err)
  }
}
