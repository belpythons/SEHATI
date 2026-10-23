/**
 * Offline Queue Service — IndexedDB-backed submission queue using idb-keyval.
 *
 * Handles offline buffering, automatic FIFO retry, and persistent
 * { localMockHash -> realShareHash } mapping to seamlessly upgrade
 * offline preview links to live server records.
 */
import { get, set, del, keys } from 'idb-keyval'
import { ScreeningSubmitPayload, ScreeningSubmitResponse } from '../types/screening'
import { screeningApi } from '../lib/api'

const QUEUE_PREFIX = 'sehati_offline_queue_'
const HASH_MAPPING_KEY = 'sehati_hash_mapping'

export interface QueuedSubmission {
  id: string
  payload: ScreeningSubmitPayload
  mockShareHash?: string
  timestamp: number
  retryCount: number
}

export interface FlushResult {
  succeededLive: number
  failed: number
  lastShareHash?: string
  lastResponse?: ScreeningSubmitResponse
}

/**
 * Store localMockHash -> realShareHash mapping in localStorage
 */
export function saveHashMapping(mockHash: string, realHash: string): void {
  try {
    const raw = localStorage.getItem(HASH_MAPPING_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[mockHash] = realHash
    localStorage.setItem(HASH_MAPPING_KEY, JSON.stringify(map))
  } catch (err) {
    console.error('Failed to save hash mapping:', err)
  }
}

/**
 * Retrieve realShareHash corresponding to a localMockHash if mapped
 */
export function getMappedRealHash(mockHash: string): string | null {
  try {
    const raw = localStorage.getItem(HASH_MAPPING_KEY)
    if (!raw) return null
    const map = JSON.parse(raw)
    return map[mockHash] || null
  } catch {
    return null
  }
}

/**
 * Add a failed submission to the offline queue with optional mockShareHash
 */
export async function enqueueSubmission(
  payload: ScreeningSubmitPayload,
  mockShareHash?: string
): Promise<string> {
  const id = `${QUEUE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const entry: QueuedSubmission = {
    id,
    payload,
    mockShareHash,
    timestamp: Date.now(),
    retryCount: 0,
  }
  await set(id, entry)
  return id
}

/**
 * Get all queued submissions from IndexedDB
 */
export async function getQueuedSubmissions(): Promise<QueuedSubmission[]> {
  const allKeys = await keys()
  const queueKeys = allKeys.filter(
    (key) => typeof key === 'string' && key.startsWith(QUEUE_PREFIX)
  )
  const entries: QueuedSubmission[] = []
  for (const key of queueKeys) {
    const entry = await get<QueuedSubmission>(key)
    if (entry) entries.push(entry)
  }
  // Sort oldest first (FIFO)
  return entries.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Remove a successfully submitted entry from the queue
 */
export async function dequeueSubmission(id: string): Promise<void> {
  await del(id)
}

/**
 * Increment retry count for a failed re-submission attempt
 */
export async function incrementRetry(id: string): Promise<void> {
  const entry = await get<QueuedSubmission>(id)
  if (entry) {
    entry.retryCount += 1
    await set(id, entry)
  }
}

/**
 * Get count of queued submissions
 */
export async function getQueueCount(): Promise<number> {
  const allKeys = await keys()
  return allKeys.filter(
    (key) => typeof key === 'string' && key.startsWith(QUEUE_PREFIX)
  ).length
}

/**
 * Clear all queued offline submissions from IndexedDB
 */
export async function clearAllQueuedSubmissions(): Promise<void> {
  const allKeys = await keys()
  const queueKeys = allKeys.filter(
    (key) => typeof key === 'string' && key.startsWith(QUEUE_PREFIX)
  )
  for (const key of queueKeys) {
    await del(key)
  }
}

/**
 * Flush the offline queue directly against the REAL backend API.
 * Automatically saves { localMockHash -> realShareHash } mapping.
 */
export async function flushQueue(): Promise<FlushResult> {
  const queued = await getQueuedSubmissions()
  let succeededLive = 0
  let failed = 0
  let lastShareHash: string | undefined
  let lastResponse: ScreeningSubmitResponse | undefined

  for (const entry of queued) {
    try {
      const res = await screeningApi.submit(entry.payload)
      await dequeueSubmission(entry.id)
      succeededLive++
      lastShareHash = res.shareHash
      lastResponse = { ...res, isMockData: false, dataSource: 'live' }

      // If this queue entry had an offline preview mock hash, map it to the real backend hash!
      if (entry.mockShareHash) {
        saveHashMapping(entry.mockShareHash, res.shareHash)
      }
    } catch (err: any) {
      const status = err?.response?.status
      // If error is HTTP 400/422 validation error, the queued payload is invalid or outdated
      // Retrying will never succeed and just causes repeated console errors. Discard it.
      if (status && status >= 400 && status < 500) {
        console.warn(`[SEHATI Queue] Removing invalid offline entry ${entry.id} (HTTP ${status}):`, err?.response?.data)
        await dequeueSubmission(entry.id)
      } else if (entry.retryCount >= 3) {
        console.warn(`[SEHATI Queue] Removing expired offline entry ${entry.id} after 3 failed retries.`)
        await dequeueSubmission(entry.id)
      } else {
        await incrementRetry(entry.id)
      }
      failed++
    }
  }

  return { succeededLive, failed, lastShareHash, lastResponse }
}
