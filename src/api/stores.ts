import { apiClient } from './client'

export type Store = {
  id: number
  name: string
  timeZone: string
  closingTime: string
  createdAt: string
  updatedAt: string
}

export type CreateStoreRequest = {
  name: string
  industry?: string
  roadAddress?: string
  closingTime?: string
}

export type UpdateStoreRequest = {
  name?: string
  industry?: string
  roadAddress?: string
  closingTime?: string
}

export function listStores() {
  return apiClient.get<Store[]>('/stores').then((res) => res.data)
}

export function createStore(payload: CreateStoreRequest) {
  return apiClient.post<Store>('/stores', payload).then((res) => res.data)
}

export function updateStore(storeId: number, payload: UpdateStoreRequest) {
  return apiClient.patch<Store>(`/stores/${storeId}`, payload).then((res) => res.data)
}
