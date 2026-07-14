import { apiClient } from './client'

export type MarketingStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED'

export type Marketing = {
  id: number
  storeId: number
  title: string
  content: string
  hashtags: string[]
  imageUrl: string | null
  status: MarketingStatus
  createdAt: string
  updatedAt: string
  publishedAt: string | null
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

export function createMarketing(storeId: number, productId: number, image: File) {
  const formData = new FormData()
  formData.append('productId', String(productId))
  formData.append('image', image)
  return apiClient
    .post<Marketing>(`/stores/${storeId}/marketings`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
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
