import { NavLink } from 'react-router-dom'
import { STORE_NAME } from '../constants'
import { useChat } from '../chatStore'

function Sidebar() {
  const { conversations } = useChat()

  return (
    <aside className="box-border flex w-60 shrink-0 min-h-svh flex-col border-r border-[#e0e0e0] bg-[#f5f5f7] p-4">
      <div className="px-3 py-2 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
        {STORE_NAME}
      </div>
      <nav className="flex flex-col gap-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-[15px] text-[#1d1d1f] no-underline transition-colors hover:bg-white ${
              isActive ? 'bg-white font-medium text-[#0066cc]' : ''
            }`
          }
        >
          홈
        </NavLink>
        <NavLink
          to="/instagram"
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-[15px] text-[#1d1d1f] no-underline transition-colors hover:bg-white ${
              isActive ? 'bg-white font-medium text-[#0066cc]' : ''
            }`
          }
        >
          인스타 홍보 생성기
        </NavLink>
      </nav>

      {conversations.length > 0 && (
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <span className="px-3 text-[12px] font-medium text-[#6e6e73]">AI 대화 기록</span>
          <div className="mt-2 flex flex-col gap-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <NavLink
                key={conversation.id}
                to={`/chat/${conversation.id}`}
                className={({ isActive }) =>
                  `truncate rounded-lg px-3 py-2 text-left text-[14px] text-[#1d1d1f] no-underline transition-colors hover:bg-white ${
                    isActive ? 'bg-white font-medium text-[#0066cc]' : ''
                  }`
                }
              >
                {conversation.title}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
