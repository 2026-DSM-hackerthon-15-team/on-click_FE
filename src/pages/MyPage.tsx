import { User as UserIcon, Mail, Store } from 'lucide-react'
import { STORE_NAME } from '../constants'
import { useAuth } from '../authStore'

function MyPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        마이페이지
      </h1>

      <div className="max-w-xl rounded-[18px] border border-[#e0e0e0] bg-white p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
            <UserIcon size={24} className="text-[#6e6e73]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              {user?.name}
            </p>
            <p className="text-[13px] text-[#6e6e73]">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#f0f0f0] pt-5">
          <div className="flex items-center gap-3">
            <Mail size={17} className="text-[#6e6e73]" strokeWidth={1.75} />
            <div>
              <p className="text-[12px] text-[#6e6e73]">이메일</p>
              <p className="text-[14px] text-[#1d1d1f]">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Store size={17} className="text-[#6e6e73]" strokeWidth={1.75} />
            <div>
              <p className="text-[12px] text-[#6e6e73]">가게 이름</p>
              <p className="text-[14px] text-[#1d1d1f]">{STORE_NAME}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-full border border-[#e0e0e0] px-5 py-2.5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default MyPage
