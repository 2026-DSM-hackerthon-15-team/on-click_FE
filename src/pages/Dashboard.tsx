import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useChat } from '../chatStore'
import { useAuth } from '../authStore'
import {
  getClosingSalesForecast,
  getDashboardSummary,
  getHourlySales,
  getHourlyVisitors,
  getTomorrowVisitorsForecast,
  type ClosingSalesForecast,
  type DashboardSummary,
  type HourlySales,
  type HourlyVisitors,
  type TomorrowVisitorsForecast,
} from '../api/dashboard'
import { getApiErrorMessage } from '../api/client'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function finiteOrZero(value: unknown) {
  return isFiniteNumber(value) ? value : 0
}

function formatWon(value: unknown) {
  return isFiniteNumber(value) ? `${Math.round(value).toLocaleString('ko-KR')}원` : '-'
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}시`
}

function formatCount(value: unknown, unit: string) {
  return isFiniteNumber(value) ? `${Math.round(value).toLocaleString('ko-KR')}${unit}` : '-'
}

function formatThousands(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? `${Math.round(number / 1000)}k` : '-'
}

function addDays(date: string, amount: number) {
  const next = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(next.getTime())) return date
  next.setUTCDate(next.getUTCDate() + amount)
  return next.toISOString().slice(0, 10)
}

function fallbackClosingForecast(summary: DashboardSummary): ClosingSalesForecast {
  const sales = finiteOrZero(summary.totalSalesAmount)
  return {
    storeId: summary.storeId,
    businessDate: summary.businessDate,
    currency: summary.currency,
    observedSalesAmount: sales,
    forecastClosingSalesAmount: sales,
    generatedAt: summary.generatedAt,
  }
}

function fallbackTomorrowVisitors(summary: DashboardSummary): TomorrowVisitorsForecast {
  return {
    storeId: summary.storeId,
    targetDate: addDays(summary.businessDate, 1),
    expectedVisitors: finiteOrZero(summary.totalVisitors),
    generatedAt: summary.generatedAt,
  }
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e0e0e0] bg-white p-5">
      <span className="text-[13px] tracking-[-0.08px] text-[#6e6e73]">{label}</span>
      <p className="mt-1 text-[28px] leading-[1.1] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
        {value}
      </p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[#6e6e73]">{label}</span>
      <span className="text-[13px] font-medium text-[#1d1d1f]">{value}</span>
    </div>
  )
}

function ChartSection({
  title,
  children,
  details,
}: {
  title: string
  children: React.ReactNode
  details: React.ReactNode
}) {
  return (
    <section className="flex aspect-square flex-col rounded-[18px] border border-[#e0e0e0] bg-white">
      <div className="border-b border-[#f0f0f0] px-6 py-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">{title}</h2>
      </div>
      <div className="min-h-0 flex-1 px-4 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 border-t border-[#f0f0f0] px-6 py-4">{details}</div>
    </section>
  )
}

function Dashboard() {
  const { sendMessage } = useChat()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [hourlySales, setHourlySales] = useState<HourlySales | null>(null)
  const [hourlyVisitors, setHourlyVisitors] = useState<HourlyVisitors | null>(null)
  const [forecast, setForecast] = useState<ClosingSalesForecast | null>(null)
  const [tomorrow, setTomorrow] = useState<TomorrowVisitorsForecast | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false

    Promise.all([
      getDashboardSummary(user.storeId),
      getHourlySales(user.storeId),
      getHourlyVisitors(user.storeId),
    ])
      .then(async ([s, sales, visitors]) => {
        const hasSalesData = finiteOrZero(s.totalSalesAmount) > 0 || finiteOrZero(s.orderCount) > 0
        const hasVisitorData = finiteOrZero(s.totalVisitors) > 0
        const [closingResult, tomorrowResult] = await Promise.allSettled([
          hasSalesData
            ? getClosingSalesForecast(user.storeId)
            : Promise.resolve(fallbackClosingForecast(s)),
          hasVisitorData
            ? getTomorrowVisitorsForecast(user.storeId)
            : Promise.resolve(fallbackTomorrowVisitors(s)),
        ])
        if (cancelled) return

        setSummary(s)
        setHourlySales(sales)
        setHourlyVisitors(visitors)
        setForecast(
          closingResult.status === 'fulfilled' ? closingResult.value : fallbackClosingForecast(s),
        )
        setTomorrow(
          tomorrowResult.status === 'fulfilled' ? tomorrowResult.value : fallbackTomorrowVisitors(s),
        )
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e, '대시보드 데이터를 불러오지 못했어요.'))
      })

    return () => {
      cancelled = true
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return
    const trimmed = inputValue
    setInputValue('')
    const chatRoomId = await sendMessage(null, trimmed)
    navigate(`/chat/${chatRoomId}`)
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#f5f5f7] p-8">
        <p className="text-[15px] text-[#ff3b30]">{error}</p>
      </div>
    )
  }

  if (!summary || !hourlySales || !hourlyVisitors || !forecast || !tomorrow) {
    return (
      <div className="min-h-full bg-[#f5f5f7] p-8">
        <p className="text-[15px] text-[#6e6e73]">불러오는 중...</p>
      </div>
    )
  }

  const salesBuckets = Array.isArray(hourlySales.hourly)
    ? hourlySales.hourly.filter((b) => isFiniteNumber(b.hour) && isFiniteNumber(b.salesAmount))
    : []
  const visitorBuckets = Array.isArray(hourlyVisitors.hourly)
    ? hourlyVisitors.hourly.filter((b) => isFiniteNumber(b.hour) && isFiniteNumber(b.visitorCount))
    : []
  const totalSalesAmount = finiteOrZero(summary.totalSalesAmount)
  const orderCount = finiteOrZero(summary.orderCount)
  const totalVisitors = finiteOrZero(summary.totalVisitors)
  const hourlyTotalSalesAmount = finiteOrZero(hourlySales.totalSalesAmount)
  const hourlyTotalVisitors = finiteOrZero(hourlyVisitors.totalVisitors)
  const forecastObservedSalesAmount = finiteOrZero(forecast.observedSalesAmount)
  const forecastClosingSalesAmount = finiteOrZero(forecast.forecastClosingSalesAmount)
  const tomorrowExpectedVisitors = finiteOrZero(tomorrow.expectedVisitors)

  const salesChartData = salesBuckets.map((b) => ({
    hour: formatHour(b.hour),
    sales: b.salesAmount,
  }))
  const visitorsChartData = visitorBuckets.map((b) => ({
    hour: formatHour(b.hour),
    visitors: b.visitorCount,
  }))
  const peakSalesHour = salesBuckets.length
    ? salesBuckets.reduce((a, b) => (b.salesAmount > a.salesAmount ? b : a))
    : null
  const lowSalesHour = salesBuckets.length
    ? salesBuckets.reduce((a, b) => (b.salesAmount < a.salesAmount ? b : a))
    : null
  const peakVisitorHour = visitorBuckets.length
    ? visitorBuckets.reduce((a, b) => (b.visitorCount > a.visitorCount ? b : a))
    : null
  const lowVisitorHour = visitorBuckets.length
    ? visitorBuckets.reduce((a, b) => (b.visitorCount < a.visitorCount ? b : a))
    : null
  const avgSales = salesBuckets.length
    ? Math.round(hourlyTotalSalesAmount / salesBuckets.length)
    : null
  const visitorGrowth =
    totalVisitors === 0
      ? 0
      : Math.round(((tomorrowExpectedVisitors - totalVisitors) / totalVisitors) * 100)

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        {user?.storeName} 통계 대시보드
      </h1>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <SummaryCard label="오늘 매출" value={formatWon(totalSalesAmount)} />
        <SummaryCard label="오늘 주문 수" value={formatCount(orderCount, '건')} />
        <SummaryCard label="방문자 수" value={formatCount(totalVisitors, '명')} />
        <SummaryCard label="마감 예상 매출" value={formatWon(forecastClosingSalesAmount)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartSection
          title="시간대별 매출"
          details={
            <>
              <DetailRow
                label="피크 시간대"
                value={
                  peakSalesHour
                    ? `${formatHour(peakSalesHour.hour)} · ${formatWon(peakSalesHour.salesAmount)}`
                    : '-'
                }
              />
              <DetailRow
                label="최저 시간대"
                value={
                  lowSalesHour
                    ? `${formatHour(lowSalesHour.hour)} · ${formatWon(lowSalesHour.salesAmount)}`
                    : '-'
                }
              />
              <DetailRow label="시간당 평균" value={formatWon(avgSales)} />
            </>
          }
        >
          <LineChart data={salesChartData}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6e6e73' }} interval={2} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6e6e73' }}
              tickFormatter={formatThousands}
            />
            <Tooltip formatter={(value) => formatWon(Number(value))} />
            <Line type="monotone" dataKey="sales" stroke="#0066cc" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartSection>

        <ChartSection
          title="시간대별 방문자"
          details={
            <>
              <DetailRow
                label="피크 시간대"
                value={
                  peakVisitorHour
                    ? `${formatHour(peakVisitorHour.hour)} · ${peakVisitorHour.visitorCount}명`
                    : '-'
                }
              />
              <DetailRow
                label="최저 시간대"
                value={
                  lowVisitorHour
                    ? `${formatHour(lowVisitorHour.hour)} · ${lowVisitorHour.visitorCount}명`
                    : '-'
                }
              />
              <DetailRow label="총 방문자" value={formatCount(hourlyTotalVisitors, '명')} />
            </>
          }
        >
          <BarChart data={visitorsChartData}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6e6e73' }} interval={2} />
            <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <Tooltip formatter={(value) => `${value}명`} />
            <Bar dataKey="visitors" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>

        <ChartSection
          title="마감 매출 예측"
          details={
            <>
              <DetailRow label="지금까지 매출" value={formatWon(forecastObservedSalesAmount)} />
              <DetailRow label="마감 예상 매출" value={formatWon(forecastClosingSalesAmount)} />
            </>
          }
        >
          <BarChart
            data={[
              { label: '현재', amount: forecastObservedSalesAmount },
              { label: '마감 예상', amount: forecastClosingSalesAmount },
            ]}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6e6e73' }}
              tickFormatter={formatThousands}
            />
            <Tooltip formatter={(value) => formatWon(Number(value))} />
            <Bar dataKey="amount" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>

        <ChartSection
          title="내일 방문자 예측"
          details={
            <>
              <DetailRow label="예상 방문자" value={formatCount(tomorrowExpectedVisitors, '명')} />
              <DetailRow label="대상일" value={tomorrow.targetDate} />
              <DetailRow label="오늘 대비" value={`${visitorGrowth >= 0 ? '+' : ''}${visitorGrowth}%`} />
            </>
          }
        >
          <BarChart data={[{ label: tomorrow.targetDate, visitors: tomorrowExpectedVisitors }]}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <Tooltip formatter={(value) => `${value}명`} />
            <Bar dataKey="visitors" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>
      </div>

      <div className="fixed right-4 bottom-8 left-4 max-w-md md:right-8 md:left-[calc(15rem+2rem)]">
        <form
          onSubmit={handleSubmit}
          className="rainbow-border rounded-full p-[4px] shadow-[0_40px_60px_-15px_rgba(0,0,0,0.7),0_60px_100px_-20px_rgba(0,0,0,0.5)]"
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

export default Dashboard
