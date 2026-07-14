import { useState } from 'react'
import { KeyRound, Mail, Store, User as UserIcon } from 'lucide-react'
import { useAuth } from '../authStore'

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] text-[#6e6e73]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
      />
    </label>
  )
}

function ProfileSection() {
  const { user, updateProfile } = useAuth()
  const [storeName, setStoreName] = useState(user?.storeName ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [accountId, setAccountId] = useState(user?.accountId ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = updateProfile({ storeName, name, accountId, email })
    setMessage(
      result.ok
        ? { type: 'ok', text: '변경사항이 저장됐어요.' }
        : { type: 'error', text: result.error ?? '저장에 실패했어요.' },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[18px] border border-[#e0e0e0] bg-white p-6">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
          <UserIcon size={24} className="text-[#6e6e73]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
            {user?.name}
          </p>
          <p className="text-[13px] text-[#6e6e73]">
            {user?.createdAt && `${new Date(user.createdAt).getFullYear()}년 ${new Date(user.createdAt).getMonth() + 1}월 ${new Date(user.createdAt).getDate()}일 가입`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#f0f0f0] pt-5">
        <Field label="매장 이름" value={storeName} onChange={setStoreName} />
        <Field label="이름" value={name} onChange={setName} />
        <Field label="아이디" value={accountId} onChange={setAccountId} />
        <Field label="이메일" value={email} onChange={setEmail} />
      </div>

      {message && (
        <p className={`mt-3 text-[13px] ${message.type === 'ok' ? 'text-[#1e8e3e]' : 'text-[#ff3b30]'}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-[#0066cc] px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
      >
        저장하기
      </button>
    </form>
  )
}

function PasswordSection() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않아요.' })
      return
    }
    const result = changePassword(currentPassword, newPassword)
    if (!result.ok) {
      setMessage({ type: 'error', text: result.error ?? '변경에 실패했어요.' })
      return
    }
    setMessage({ type: 'ok', text: '비밀번호가 변경됐어요.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[18px] border border-[#e0e0e0] bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound size={17} className="text-[#6e6e73]" strokeWidth={1.75} />
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">비밀번호 변경</h2>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="현재 비밀번호"
          className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
        />
        <input
          type="password"
          required
          minLength={4}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="새 비밀번호"
          className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
        />
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="새 비밀번호 확인"
          className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
        />
      </div>

      {message && (
        <p className={`mt-3 text-[13px] ${message.type === 'ok' ? 'text-[#1e8e3e]' : 'text-[#ff3b30]'}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        className="mt-5 w-full rounded-full border border-[#e0e0e0] px-5 py-2.5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
      >
        비밀번호 변경
      </button>
    </form>
  )
}

function MyPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        마이페이지
      </h1>

      <div className="flex max-w-xl flex-col gap-4">
        <ProfileSection />

        <div className="rounded-[18px] border border-[#e0e0e0] bg-white p-6">
          <div className="flex items-center gap-3">
            <Store size={17} className="text-[#6e6e73]" strokeWidth={1.75} />
            <div>
              <p className="text-[12px] text-[#6e6e73]">등록된 매장</p>
              <p className="text-[14px] text-[#1d1d1f]">{user?.storeName}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Mail size={17} className="text-[#6e6e73]" strokeWidth={1.75} />
            <div>
              <p className="text-[12px] text-[#6e6e73]">이메일</p>
              <p className="text-[14px] text-[#1d1d1f]">{user?.email}</p>
            </div>
          </div>
        </div>

        <PasswordSection />

        <button
          type="button"
          onClick={logout}
          className="w-full rounded-full border border-[#e0e0e0] bg-white px-5 py-2.5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default MyPage
