import { apiClient } from './client'

export type MarketingStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED'

export type MarketingMedia = {
  mediaId: number
  url: string
}

export type Marketing = {
  marketingId: number
  storeId: number
  title: string
  content: string
  hashtags: string[]
  media: MarketingMedia[]
  status: MarketingStatus
  publishAttemptCount: number
  externalPostId: string | null
  publishedUrl: string | null
  failureReason: string | null
  approvedAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateMarketingRequest = {
  productName: string
  description: string
  price?: number
  promotion?: string
  targetAudience?: string
  tone?: string
  additionalRequest?: string
  mediaIds?: number[]
}

export type UpdateMarketingRequest = {
  title?: string
  content?: string
  hashtags?: string[]
}

export function listMarketings(storeId: number) {
  return apiClient.get<Marketing[]>(`/stores/${storeId}/marketings`).then((res) => res.data)
}

export function getMarketing(storeId: number, marketingId: number) {
  return apiClient
    .get<Marketing>(`/stores/${storeId}/marketings/${marketingId}`)
    .then((res) => res.data)
}

export function createMarketing(storeId: number, payload: CreateMarketingRequest) {
  return apiClient
    .post<Marketing>(`/stores/${storeId}/marketings`, payload)
    .then((res) => res.data)
}

export function updateMarketing(
  storeId: number,
  marketingId: number,
  payload: UpdateMarketingRequest,
) {
  return apiClient
    .patch<Marketing>(`/stores/${storeId}/marketings/${marketingId}`, payload)
    .then((res) => res.data)
}

export function approveMarketing(storeId: number, marketingId: number) {
  return apiClient
    .post<Marketing>(`/stores/${storeId}/marketings/${marketingId}/approve`)
    .then((res) => res.data)
}
