import { apiClient } from './client'

export type ChatRoom = {
  id: number
  storeId: number
  title: string
  createdAt: string
  updatedAt: string
}

export type ChatMessageStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export type ChatMessageRole = 'USER' | 'ASSISTANT'

export type ChatMessage = {
  id: number
  chatRoomId: number
  clientMessageId: string | null
  role: ChatMessageRole
  status: ChatMessageStatus
  content: string
  retryCount: number
  createdAt: string
  updatedAt: string
}

export type SendMessageResponse = {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}

export function listChatRooms(storeId: number) {
  return apiClient.get<ChatRoom[]>(`/stores/${storeId}/chat-rooms`).then((res) => res.data)
}

export function createChatRoom(storeId: number) {
  return apiClient.post<ChatRoom>(`/stores/${storeId}/chat-rooms`, {}).then((res) => res.data)
}

export function getChatRoom(storeId: number, chatRoomId: number) {
  return apiClient
    .get<ChatRoom & { messages: ChatMessage[] }>(`/stores/${storeId}/chat-rooms/${chatRoomId}`)
    .then((res) => res.data)
}

export function deleteChatRoom(storeId: number, chatRoomId: number) {
  return apiClient.delete<void>(`/stores/${storeId}/chat-rooms/${chatRoomId}`).then((res) => res.data)
}

export function listMessages(storeId: number, chatRoomId: number, afterId?: number) {
  return apiClient
    .get<ChatMessage[]>(`/stores/${storeId}/chat-rooms/${chatRoomId}/messages`, {
      params: afterId ? { afterId } : undefined,
    })
    .then((res) => res.data)
}

export function sendMessage(
  storeId: number,
  chatRoomId: number,
  content: string,
  clientMessageId?: string,
) {
  return apiClient
    .post<SendMessageResponse>(`/stores/${storeId}/chat-rooms/${chatRoomId}/messages`, {
      content,
      clientMessageId,
    })
    .then((res) => res.data)
}
