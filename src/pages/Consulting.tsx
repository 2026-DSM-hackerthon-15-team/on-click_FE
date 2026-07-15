import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, RefreshCw, Sparkles } from 'lucide-react'
import { useAuth } from '../authStore'
import { getConsulting, listConsultings, requestConsulting, type Consulting } from '../api/consulting'
import { getApiErrorMessage } from '../api/client'

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function toKstParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  }
}

function addDays(dateStr: string, amount: number) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + amount)
  return d.toISOString().slice(0, 10)
}

// 마감 전이면 어제까지, 마감 후(포함)면 오늘까지 생성 가능
function latestGeneratableDate(closingTime: string | undefined): string {
  const now = toKstParts(new Date())
  if (!closingTime) return addDays(now.dateStr, -1)

  const [closeHour, closeMinute] = closingTime.split(':').map(Number)
  const isPastClosing =
    now.hour > closeHour || (now.hour === closeHour && now.minute >= closeMinute)

  return isPastClosing ? now.dateStr : addDays(now.dateStr, -1)
}

function ConsultingList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [consultings, setConsultings] = useState<Consulting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    listConsultings(user.storeId)
      .then(setConsultings)
      .catch((e) => setError(getApiErrorMessage(e, '컨설팅 목록을 불러오지 못했어요.')))
      .finally(() => setIsLoading(false))
  }, [user])

  async function handleRequest() {
    if (!user) return
    setIsRequesting(true)
    setError('')
    try {
      const targetDate = latestGeneratableDate(user.closingTime)
      const created = await requestConsulting(user.storeId, targetDate)
      setConsultings((prev) => {
        const withoutDuplicate = prev.filter((c) => c.consultingId !== created.consultingId)
        return [created, ...withoutDuplicate]
      })
    } catch (e) {
      setError(getApiErrorMessage(e, '컨설팅 생성 요청에 실패했어요. 잠시 후 다시 시도해주세요.'))
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[#0066cc]" strokeWidth={1.75} />
          <h1 className="text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
            컨설팅 리포트
          </h1>
        </div>
        <button
          type="button"
          onClick={handleRequest}
          disabled={isRequesting}
          className="flex items-center gap-1.5 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRequesting ? 'animate-spin' : ''} />
          {isRequesting ? '요청 중...' : '컨설팅 생성 요청'}
        </button>
      </div>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        {user?.storeName}의 날짜별 운영 컨설팅 기록이에요.
      </p>

      {error && <p className="mb-4 text-[13px] text-[#ff3b30]">{error}</p>}

      {isLoading ? (
        <p className="text-[14px] text-[#6e6e73]">불러오는 중...</p>
      ) : consultings.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#e0e0e0] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#6e6e73]">
            아직 생성된 컨설팅이 없어요. 위 버튼을 눌러 컨설팅을 요청해보세요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {consultings.map((consulting) => (
            <button
              key={consulting.consultingId}
              type="button"
              onClick={() => navigate(`/consulting/${consulting.consultingId}`)}
              className="flex items-center justify-between rounded-[18px] border border-[#e0e0e0] bg-white px-6 py-5 text-left transition-colors hover:bg-[#fafafc]"
            >
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
                  {formatDateLabel(consulting.targetDate)}
                  {consulting.title ? ` · ${consulting.title}` : ''}
                </h2>
                <p className="mt-1 text-[13px] text-[#6e6e73]">
                  {consulting.status === 'PENDING'
                    ? '생성 중...'
                    : consulting.status === 'FAILED'
                      ? '생성 실패'
                      : '생성 완료'}
                </p>
              </div>
              <ChevronLeft size={18} className="rotate-180 text-[#c7c7cc]" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ConsultingDetail() {
  const { consultingId: consultingIdParam } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [consulting, setConsulting] = useState<Consulting | null>(null)
  const [error, setError] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)
  const parsedConsultingId = Number(consultingIdParam)
  const consultingId =
    Number.isInteger(parsedConsultingId) && parsedConsultingId > 0 ? parsedConsultingId : null

  useEffect(() => {
    if (!user || !consultingId) {
      if (!consultingId) setError('해당 컨설팅을 찾을 수 없어요.')
      return
    }

    let cancelled = false

    function load() {
      if (!user || !consultingId) return
      getConsulting(user.storeId, consultingId)
        .then((data) => {
          if (cancelled) return
          setConsulting(data)
        })
        .catch((e) => {
          if (!cancelled) setError(getApiErrorMessage(e, '해당 컨설팅을 찾을 수 없어요.'))
        })
    }

    load()
    const timer = setInterval(() => {
      if (consulting?.status === 'PENDING' || !consulting) load()
    }, 2000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, consultingId])

  async function handleRetry() {
    if (!user || !consulting) return
    setIsRetrying(true)
    setError('')
    try {
      const result = await requestConsulting(user.storeId, consulting.targetDate)
      setConsulting(result)
    } catch (e) {
      setError(getApiErrorMessage(e, '다시 요청하는 데 실패했어요.'))
    } finally {
      setIsRetrying(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#f5f5f7] p-8">
        <p className="text-[15px] text-[#ff3b30]">{error}</p>
      </div>
    )
  }

  if (!consulting) {
    return (
      <div className="min-h-full bg-[#f5f5f7] p-8">
        <p className="text-[15px] text-[#6e6e73]">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <button
        type="button"
        onClick={() => navigate('/consulting')}
        className="mb-4 flex items-center gap-1 text-[14px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
      >
        <ChevronLeft size={16} />
        목록으로
      </button>

      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={20} className="text-[#0066cc]" strokeWidth={1.75} />
        <h1 className="text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
          {formatDateLabel(consulting.targetDate)} 컨설팅 리포트
        </h1>
      </div>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        {user?.storeName}의 운영 데이터를 바탕으로 한 맞춤 제안이에요.
      </p>

      <div className="rounded-[18px] border border-[#e0e0e0] bg-white p-6">
        {consulting.status === 'PENDING' && (
          <p className="flex items-center gap-2 text-[14px] text-[#6e6e73]">
            <RefreshCw size={15} className="animate-spin" />
            컨설팅을 생성하고 있어요. 잠시 후 자동으로 갱신돼요.
          </p>
        )}

        {consulting.status === 'FAILED' && (
          <div>
            <p className="mb-4 text-[14px] text-[#ff3b30]">
              컨설팅 생성에 실패했어요. (시도 {consulting.attemptCount}회)
            </p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-1.5 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
              {isRetrying ? '재요청 중...' : '다시 시도'}
            </button>
          </div>
        )}

        {consulting.status === 'COMPLETED' && (
          <>
            <h2 className="mb-2 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              {consulting.title}
            </h2>
            <p className="whitespace-pre-line text-[14px] leading-[1.6] text-[#6e6e73]">
              {consulting.content}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export { ConsultingList, ConsultingDetail }
