import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../authStore'
import { useChat } from '../chatStore'
import { getChatRoom, listMessages, sendMessage as apiSendMessage, type ChatMessage } from '../api/chat'

function Chat() {
  const { id } = useParams()
  const chatRoomId = Number(id)
  const { user } = useAuth()
  const { conversations, refreshConversations } = useChat()
  const conversation = conversations.find((c) => c.id === chatRoomId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!user || !chatRoomId) return
    getChatRoom(user.storeId, chatRoomId).then((room) => setMessages(room.messages))
  }, [user, chatRoomId])

  useEffect(() => {
    if (!user || !chatRoomId) return
    const hasPending = messages.some((m) => m.status === 'PENDING')
    if (!hasPending) return

    const timer = setInterval(() => {
      listMessages(user.storeId, chatRoomId).then(setMessages)
    }, 2000)
    return () => clearInterval(timer)
  }, [user, chatRoomId, messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || !user || !chatRoomId) return
    setIsSending(true)
    const trimmed = inputValue
    setInputValue('')
    try {
      const result = await apiSendMessage(user.storeId, chatRoomId, trimmed)
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage])
      refreshConversations()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-svh flex-col bg-white">
      <div className="border-b border-[#f0f0f0] px-8 py-5">
        <h1 className="text-[19px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
          {conversation?.title || 'AI 어시스턴트'}
        </h1>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto px-6 py-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.4] ${
                message.role === 'USER'
                  ? 'rounded-br-[4px] bg-[#0066cc] text-white'
                  : 'rounded-bl-[4px] bg-[#f0f0f0] text-[#1d1d1f]'
              }`}
            >
              {message.status === 'PENDING' ? '답변 생성 중...' : message.content}
            </div>
          </div>
        ))}
        {!conversation && messages.length === 0 && (
          <p className="text-[15px] text-[#6e6e73]">대화를 찾을 수 없어요.</p>
        )}
      </div>

      <div className="flex justify-center border-t border-[#f0f0f0] px-6 py-5">
        <form
          onSubmit={handleSubmit}
          className="rainbow-border w-full max-w-2xl rounded-full p-[3px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-3 rounded-full bg-black px-5 py-3">
            <Sparkles size={18} className="shrink-0 text-white" strokeWidth={1.75} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSending}
              placeholder="궁금한 점이 있을까요?"
              className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[#8e8e93] disabled:opacity-50"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat
