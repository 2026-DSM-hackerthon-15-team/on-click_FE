import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useChat } from '../chatStore'

function Chat() {
  const { id } = useParams()
  const { conversations, sendMessage } = useChat()
  const conversation = conversations.find((c) => c.id === id)
  const [inputValue, setInputValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || !id) return
    sendMessage(id, inputValue)
    setInputValue('')
  }

  return (
    <div className="flex h-svh flex-col bg-white">
      <div className="border-b border-[#f0f0f0] px-8 py-5">
        <h1 className="text-[19px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
          {conversation?.title ?? 'AI 어시스턴트'}
        </h1>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto px-6 py-8">
        {conversation?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.4] whitespace-pre-line ${
                message.role === 'user'
                  ? 'rounded-br-[4px] bg-[#0066cc] text-white'
                  : 'rounded-bl-[4px] bg-[#f0f0f0] text-[#1d1d1f]'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {conversation?.isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[4px] bg-[#f0f0f0] px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9a9a9e] [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9a9a9e] [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9a9a9e]" />
            </div>
          </div>
        )}
        {!conversation && (
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
              placeholder="궁금한 점이 있을까요?"
              className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[#8e8e93]"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat
