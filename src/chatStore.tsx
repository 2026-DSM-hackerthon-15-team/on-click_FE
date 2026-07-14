import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './authStore'
import {
  createChatRoom,
  listChatRooms,
  sendMessage as apiSendMessage,
  type ChatRoom,
} from './api/chat'

type ChatContextValue = {
  conversations: ChatRoom[]
  refreshConversations: () => void
  sendMessage: (chatRoomId: number | null, text: string) => Promise<number>
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatRoom[]>([])

  function refreshConversations() {
    if (!user) return
    listChatRooms(user.storeId).then(setConversations)
  }

  useEffect(() => {
    refreshConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function sendMessage(chatRoomId: number | null, text: string): Promise<number> {
    if (!user) throw new Error('로그인이 필요해요.')
    const trimmed = text.trim()

    const roomId = chatRoomId ?? (await createChatRoom(user.storeId)).id
    await apiSendMessage(user.storeId, roomId, trimmed)
    refreshConversations()
    return roomId
  }

  return (
    <ChatContext.Provider value={{ conversations, refreshConversations, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
