import axios, { AxiosInstance, AxiosResponse } from 'axios'
import {
  ScreeningSubmitPayload,
  ScreeningSubmitResponse,
  ScreeningRecord,
} from '../types/screening'

// Base URL configured from Vite environment or default to local backend gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// Response interceptor for streamlined error logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.warn('[SEHATI API Error]:', error?.response?.data || error?.message)
    return Promise.reject(error)
  }
)

/**
 * Real backend API methods matching Backend API Gateway FDD & Prisma schema
 */
export const screeningApi = {
  /**
   * Submit screening questionnaire data to POST /api/v1/screening/submit
   * (Active in backend/src/routes/screening.routes.ts)
   */
  async submit(payload: ScreeningSubmitPayload): Promise<ScreeningSubmitResponse> {
    const response = await apiClient.post<ScreeningSubmitResponse>(
      '/api/v1/screening/submit',
      payload
    )
    return response.data
  },

  /**
   * [PLACEHOLDER / FUTURE ENDPOINT]
   * NOTE: Backend routes currently only expose POST /api/v1/screening/submit.
   * Endpoint GET /api/v1/screening/share/:shareHash is not yet implemented on the backend.
   * This method is prepared for future backend support; during development,
   * screeningService routes shareHash lookups to the local mock/cache layer.
   */
  async getByShareHash(shareHash: string): Promise<ScreeningSubmitResponse> {
    const response = await apiClient.get<ScreeningSubmitResponse>(
      `/api/v1/screening/share/${shareHash}`
    )
    return response.data
  },

  /**
   * Health check endpoint for connection verification (GET /api/v1/health)
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; db?: string }> {
    const response = await apiClient.get('/api/v1/health')
    return response.data
  },
}

export default apiClient
