import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authStore'
import { STORE_NAME } from '../constants'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error ?? '로그인에 실패했어요.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-sm rounded-[18px] border border-[#e0e0e0] bg-white p-8">
        <h1 className="mb-1 text-[22px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
          로그인
        </h1>
        <p className="mb-6 text-[14px] text-[#6e6e73]">{STORE_NAME} 사장님, 다시 오셨네요.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
          />

          {error && <p className="text-[13px] text-[#ff3b30]">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-full bg-[#0066cc] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          >
            로그인
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-[#6e6e73]">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-[#0066cc] no-underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
