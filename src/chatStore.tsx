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
  isTyping: boolean
}

const GREETING_REPLIES = [
  '안녕하세요! 오늘 매장 운영에 대해 궁금한 점이 있으면 편하게 물어봐주세요 😊',
  '안녕하세요, 사장님! 매출이나 방문자 추이, 컨설팅 등 무엇이든 도와드릴게요.',
]

const SALES_ANALYSIS_REPLIES = [
  `오늘 매출을 살펴봤어요 📊

• 피크 시간대는 12시~13시와 19시 전후예요. 점심·저녁 시간대에 매출이 집중되고 있어요.
• 어제 대비 방문자 수가 소폭 증가하는 추세라, 최근 프로모션이 효과가 있었던 것 같아요.
• 다만 15시~17시 사이 방문자가 눈에 띄게 적어요. 이 시간대에 할인 쿠폰이나 세트 메뉴를 운영하면 매출 공백을 메울 수 있을 거예요.

더 자세한 시간대별 데이터는 홈 대시보드에서 확인하실 수 있어요.`,
  `최근 매출 흐름을 분석해봤어요 📈

• 지난 3일간 매출이 꾸준히 우상향하고 있어요. 특히 저녁 시간대(18시~20시) 성장이 뚜렷해요.
• 평균 객단가는 안정적으로 유지되고 있고, 재방문 고객 비중이 늘어난 것으로 보여요.
• 마감 직전 시간대(21시 이후) 매출이 상대적으로 낮으니, 마감 할인 이벤트를 고려해보시면 좋을 것 같아요.

컨설팅 리포트에서 더 상세한 원인 분석도 확인해보세요.`,
  `매출 데이터를 확인해봤어요 💰

• 오늘 누적 매출은 어제보다 소폭 높은 수준이에요. 특히 점심 세트 메뉴 판매가 늘어난 게 크게 작용했어요.
• 주문 건당 평균 금액은 비슷하게 유지되고 있어서, 방문자 수 자체가 매출을 밀어올리고 있는 흐름이에요.
• 다음 주에는 계절 메뉴를 함께 홍보하면 객단가를 조금 더 끌어올릴 수 있을 것 같아요.

궁금한 시간대나 메뉴가 있으면 더 자세히 짚어드릴게요.`,
]

const VISITOR_ANALYSIS_REPLIES = [
  `방문자 데이터를 분석해봤어요 👥

• 오늘 방문자는 어제 대비 소폭 늘었고, 저녁 시간대 유입이 특히 두드러졌어요.
• 신규 방문자 비중이 늘고 있어서, 최근 홍보 효과가 나타나는 것 같아요.
• 다만 오전 시간대는 여전히 한산해요. 오픈 시간대 프로모션을 검토해보시면 좋을 것 같아요.`,
  `최근 방문자 추이를 살펴봤어요 📈

• 지난 며칠간 방문자 수가 꾸준히 늘고 있어요. 특히 재방문 고객 비중이 높아지는 추세예요.
• 내일은 오늘보다 방문자가 소폭 줄어들 것으로 예상돼요. 재료 발주량을 참고해보세요.`,
]

const DUMMY_REPLIES = [
  '평균 별점은 안정적으로 유지되고 있어요. 최근 리뷰에서 특별한 이슈는 발견되지 않았어요.',
  '피크 시간대에 인력을 한 명 더 배치하면 대기 시간을 줄이고 놓치는 주문을 막을 수 있어요.',
  '인기 메뉴를 SNS에 홍보하면 신규 방문자 유입에 도움이 될 것 같아요.',
  '컨설팅 리포트에서 날짜별 운영 인사이트를 확인해보실 수 있어요. 필요하시면 안내해드릴게요.',
]

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

function isGreeting(text: string): boolean {
  const normalized = normalize(text).replace(/[?!.~ㅋㅎ\s]/g, '')
  return ['안녕', '안녕하세요', '안뇽', 'hi', 'hello'].some((g) => normalized.includes(g))
}

function isSalesRequest(text: string): boolean {
  const normalized = normalize(text)
  return ['매출', '판매', '영업', '수익', '매상'].some((keyword) => normalized.includes(keyword))
}

function isVisitorRequest(text: string): boolean {
  const normalized = normalize(text)
  return ['방문자', '손님', '고객수', '내점'].some((keyword) => normalized.includes(keyword))
}

function pickReply(userText: string): string {
  if (isGreeting(userText)) {
    return GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)]
  }
  if (isSalesRequest(userText)) {
    return SALES_ANALYSIS_REPLIES[Math.floor(Math.random() * SALES_ANALYSIS_REPLIES.length)]
  }
  if (isVisitorRequest(userText)) {
    return VISITOR_ANALYSIS_REPLIES[Math.floor(Math.random() * VISITOR_ANALYSIS_REPLIES.length)]
  }
  return DUMMY_REPLIES[Math.floor(Math.random() * DUMMY_REPLIES.length)]
}

// 답변 길이에 비례한 "타이핑" 지연 + 약간의 랜덤성으로 실제 생성 느낌을 냄
function replyDelayMs(reply: string): number {
  const base = 900
  const perChar = 12
  const jitter = Math.random() * 600
  return Math.min(base + reply.length * perChar + jitter, 4200)
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
    const reply = pickReply(trimmed)

    let targetId = conversationId

    if (conversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, userMessage], isTyping: true }
            : c,
        ),
      )
    } else {
      const newConversation: Conversation = {
        id: crypto.randomUUID(),
        title: trimmed.length > 20 ? `${trimmed.slice(0, 20)}...` : trimmed,
        messages: [userMessage],
        isTyping: true,
      }
      targetId = newConversation.id
      setConversations((prev) => [newConversation, ...prev])
    }

    const conversationIdForReply = targetId as string
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: reply,
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationIdForReply
            ? { ...c, messages: [...c.messages, assistantMessage], isTyping: false }
            : c,
        ),
      )
    }, replyDelayMs(reply))

    return conversationIdForReply
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
