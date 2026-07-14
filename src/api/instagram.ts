import { apiClient } from './client'

export type InstagramConnectionStatus = {
  connected: boolean
  instagramUserId: string | null
  username: string | null
  tokenExpiresAt: string | null
  connectedAt: string | null
}

export type InstagramConnectStart = {
  authorizationUrl: string
  expiresAt: string
}

export function getInstagramConnection(storeId: number) {
  return apiClient
    .get<InstagramConnectionStatus>(`/stores/${storeId}/integrations/instagram`)
    .then((res) => res.data)
}

export function startInstagramConnect(storeId: number) {
  return apiClient
    .post<InstagramConnectStart>(`/stores/${storeId}/integrations/instagram/connect`)
    .then((res) => res.data)
}

export function disconnectInstagram(storeId: number) {
  return apiClient
    .delete<void>(`/stores/${storeId}/integrations/instagram`)
    .then((res) => res.data)
}
