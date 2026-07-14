import { apiClient } from './client'

export type InstagramAccount = {
  accountId: string
  password: string
}

export type InstagramAccountSummary = {
  accountId: string
  createdAt: string
  updatedAt: string
}

export function getInstagramAccount(storeId: number) {
  return apiClient
    .get<InstagramAccount>(`/stores/${storeId}/instagram-account`)
    .then((res) => res.data)
}

export function registerInstagramAccount(storeId: number, accountId: string, password: string) {
  return apiClient
    .put<InstagramAccountSummary>(`/stores/${storeId}/instagram-account`, { accountId, password })
    .then((res) => res.data)
}
