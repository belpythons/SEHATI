import { screeningApi } from '../lib/api'
import { mockScreeningApi } from '../lib/mockApi'
import {
  ScreeningSubmitPayload,
  ScreeningSubmitResponse,
  ScreeningRecord,
  ScreeningFormData,
} from '../types/screening'

const DRAFT_STORAGE_KEY = 'sehati_offline_screening_draft'

export const screeningService = {
  /**
   * Submit screening questionnaire with resilient offline / mock fallback
   */
  async submitScreening(payload: ScreeningSubmitPayload): Promise<ScreeningSubmitResponse> {
    try {
      // Attempt real backend call
      const response = await screeningApi.submit(payload)
      return {
        ...response,
        isMockData: false,
        dataSource: 'live',
      }
    } catch (error) {
      console.info(
        '[SEHATI Service] Real backend unavailable or offline, activating mock API layer:',
        error
      )
      // Fallback to local mock engine with identical response structure
      const mockRes = await mockScreeningApi.submit(payload)
      return {
        ...mockRes,
        isMockData: true,
        dataSource: 'mock',
      }
    }
  },

  /**
   * Fetch screening record by shareHash (e.g. for /analytics/:shareHash)
   */
  async getScreeningByHash(shareHash: string): Promise<ScreeningSubmitResponse> {
    try {
      const response = await screeningApi.getByShareHash(shareHash)
      return {
        ...response,
        isMockData: false,
        dataSource: 'live',
      }
    } catch {
      const mockRes = await mockScreeningApi.getByShareHash(shareHash)
      return {
        ...mockRes,
        isMockData: true,
        dataSource: 'mock',
      }
    }
  },

  /**
   * Offline Draft Management
   */
  saveDraft(formData: ScreeningFormData): boolean {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData))
      return true
    } catch (err) {
      console.error('Failed to save draft locally:', err)
      return false
    }
  },

  loadDraft(): ScreeningFormData | null {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {}
  },
}

export default screeningService
