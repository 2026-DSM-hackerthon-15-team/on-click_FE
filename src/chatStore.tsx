import { createContext, useContext, useState, type ReactNode } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
}

const DUMMY_REPLIES = [
  '오늘 오후 1시~2시 사이 매출이 가장 높았어요. 재고를 여유 있게 준비해두시는 걸 추천드려요.',
  '이번 주 방문자 수는 지난주 대비 소폭 증가하는 추세예요. 저녁 시간대 프로모션이 효과적일 것 같아요.',
  '내일은 오늘보다 방문자가 조금 줄어들 것으로 예상돼요. 재료 발주량을 참고해보세요.',
  '평균 별점은 안정적으로 유지되고 있어요. 최근 리뷰에서 특별한 이슈는 발견되지 않았어요.',
]

function pickDummyReply(): string {
  return DUMMY_REPLIES[Math.floor(Math.random() * DUMMY_REPLIES.length)]
}

type ChatContextValue = {
  conversations: Conversation[]
  sendMessage: (conversationId: string | null, text: string) => string
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  function sendMessage(conversationId: string | null, text: string): string {
    const trimmed = text.trim()
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: pickDummyReply(),
    }

    if (conversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, userMessage, assistantMessage] }
            : c,
        ),
      )
      return conversationId
    }

    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: trimmed.length > 20 ? `${trimmed.slice(0, 20)}...` : trimmed,
      messages: [userMessage, assistantMessage],
    }
    setConversations((prev) => [newConversation, ...prev])
    return newConversation.id
  }

  return (
    <ChatContext.Provider value={{ conversations, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
