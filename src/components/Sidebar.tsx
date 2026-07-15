import { NavLink } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useChat } from '../chatStore'
import { useAuth } from '../authStore'

function Sidebar() {
  const { conversations } = useChat()
  const { user, logout } = useAuth()

  return (
    <aside className="box-border flex min-h-svh w-60 shrink-0 flex-col overflow-hidden border-r border-[#e0e0e0] bg-[#f5f5f7] p-4">
      <div className="truncate px-3 py-2 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
        {user?.storeName}
      </div>
      <nav className="flex min-w-0 flex-col gap-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block min-w-0 truncate rounded-lg px-3 py-2 text-[15px] text-[#1d1d1f] no-underline transition-colors hover:bg-white ${
              isActive ? 'bg-white font-medium text-[#0066cc]' : ''
            }`
          }
        >
          홈
        </NavLink>
        <NavLink
          to="/instagram"
          className={({ isActive }) =>
            `block min-w-0 truncate rounded-lg px-3 py-2 text-[15px] text-[#1d1d1f] no-underline transition-colors hover:bg-white ${
              isActive ? 'bg-white font-medium text-[#0066cc]' : ''
            }`
          }
        >
          인스타 홍보 생성기
        </NavLink>
        <NavLink
          to="/consulting"
          className={({ isActive }) =>
            `block min-w-0 truncate rounded-lg px-3 py-2 text-[15px] text-[#1d1d1f] no-underline transition-colors hover:bg-white ${
              isActive ? 'bg-white font-medium text-[#0066cc]' : ''
            }`
          }
        >
          오늘의 컨설팅 확인하기
        </NavLink>
      </nav>

      {conversations.length > 0 && (
        <div className="mt-6 flex min-h-0 min-w-0 flex-1 flex-col">
          <span className="truncate px-3 text-[12px] font-medium text-[#6e6e73]">AI 대화 기록</span>
          <div className="mt-2 flex min-w-0 flex-col gap-1 overflow-y-auto">
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
                {conversation.title || '새 채팅'}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {user && (
        <div className="mt-4 flex min-w-0 items-center justify-between gap-2 border-t border-[#e0e0e0] px-3 pt-4">
          <NavLink
            to="/mypage"
            className={({ isActive }) =>
              `flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg py-1 text-[14px] text-[#1d1d1f] no-underline transition-colors hover:text-[#0066cc] ${
                isActive ? 'font-medium text-[#0066cc]' : ''
              }`
            }
          >
            <User size={15} className="shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate">{user.name}</span>
              <span className="text-[11px] text-[#6e6e73]">마이페이지</span>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={logout}
            aria-label="로그아웃"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6e6e73] transition-colors hover:bg-white"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
