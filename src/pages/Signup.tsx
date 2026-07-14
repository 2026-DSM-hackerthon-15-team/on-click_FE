import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authStore'

function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [storeName, setStoreName] = useState('')
  const [name, setName] = useState('')
  const [accountId, setAccountId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await signUp(accountId, email, password, name, storeName)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? '회원가입에 실패했어요.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-sm rounded-[18px] border border-[#e0e0e0] bg-white p-8">
        <h1 className="mb-1 text-[22px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
          회원가입
        </h1>
        <p className="mb-6 text-[14px] text-[#6e6e73]">매장을 등록하고 시작해보세요.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="매장 이름"
            className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
          />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
          />
          <input
            type="text"
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="아이디"
            className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
          />
          <input
            type="password"
            required
            minLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
          />

          {error && <p className="text-[13px] text-[#ff3b30]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-[#0066cc] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-[#6e6e73]">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-[#0066cc] no-underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
