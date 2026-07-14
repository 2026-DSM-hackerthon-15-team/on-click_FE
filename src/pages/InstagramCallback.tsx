import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { saveInstagramConnection } from '../instagramAuth'

function InstagramCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      setStatus('error')
      return
    }

    saveInstagramConnection({
      username: 'connected_account',
      connectedAt: new Date().toISOString(),
    })
    setStatus('success')

    const timer = setTimeout(() => navigate('/instagram'), 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#f5f5f7] p-8">
      {status === 'success' ? (
        <>
          <CheckCircle2 size={32} className="text-[#0066cc]" strokeWidth={1.75} />
          <p className="text-[15px] text-[#1d1d1f]">인스타그램 연동이 완료됐어요.</p>
        </>
      ) : (
        <>
          <XCircle size={32} className="text-[#ff3b30]" strokeWidth={1.75} />
          <p className="text-[15px] text-[#1d1d1f]">인스타그램 연동에 실패했어요.</p>
          <button
            type="button"
            onClick={() => navigate('/instagram')}
            className="mt-2 rounded-full bg-[#0066cc] px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            돌아가기
          </button>
        </>
      )}
    </div>
  )
}

export default InstagramCallback
