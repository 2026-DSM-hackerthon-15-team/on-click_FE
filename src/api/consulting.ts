import { apiClient } from './client'

export type ConsultingStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export type Consulting = {
  id: number
  storeId: number
  targetDate: string
  title: string
  content: string
  status: ConsultingStatus
  createdAt: string
  updatedAt: string
}

export function listConsultings(storeId: number) {
  return apiClient.get<Consulting[]>(`/stores/${storeId}/consultings`).then((res) => res.data)
}

export function getConsulting(storeId: number, consultingId: number) {
  return apiClient
    .get<Consulting>(`/stores/${storeId}/consultings/${consultingId}`)
    .then((res) => res.data)
}

export function requestConsulting(storeId: number, targetDate: string) {
  return apiClient
    .post<Consulting>(`/stores/${storeId}/consultings`, { targetDate })
    .then((res) => res.data)
}
