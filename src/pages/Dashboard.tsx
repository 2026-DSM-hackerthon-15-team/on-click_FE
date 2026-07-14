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

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}시`
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
    Promise.all([
      getDashboardSummary(user.storeId),
      getHourlySales(user.storeId),
      getHourlyVisitors(user.storeId),
      getClosingSalesForecast(user.storeId),
      getTomorrowVisitorsForecast(user.storeId),
    ])
      .then(([s, sales, visitors, closing, tomorrowForecast]) => {
        setSummary(s)
        setHourlySales(sales)
        setHourlyVisitors(visitors)
        setForecast(closing)
        setTomorrow(tomorrowForecast)
      })
      .catch((e) => setError(getApiErrorMessage(e, '대시보드 데이터를 불러오지 못했어요.')))
  }, [user])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return
    const conversationId = sendMessage(null, inputValue)
    setInputValue('')
    navigate(`/chat/${conversationId}`)
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

  const salesChartData = hourlySales.hourly.map((b) => ({
    hour: formatHour(b.hour),
    sales: b.salesAmount,
  }))
  const visitorsChartData = hourlyVisitors.hourly.map((b) => ({
    hour: formatHour(b.hour),
    visitors: b.visitorCount,
  }))
  const peakSalesHour = hourlySales.hourly.reduce((a, b) => (b.salesAmount > a.salesAmount ? b : a))
  const lowSalesHour = hourlySales.hourly.reduce((a, b) => (b.salesAmount < a.salesAmount ? b : a))
  const peakVisitorHour = hourlyVisitors.hourly.reduce((a, b) =>
    b.visitorCount > a.visitorCount ? b : a,
  )
  const lowVisitorHour = hourlyVisitors.hourly.reduce((a, b) =>
    b.visitorCount < a.visitorCount ? b : a,
  )
  const avgSales = Math.round(hourlySales.totalSalesAmount / hourlySales.hourly.length)
  const visitorGrowth =
    summary.totalVisitors === 0
      ? 0
      : Math.round(((tomorrow.expectedVisitors - summary.totalVisitors) / summary.totalVisitors) * 100)

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        {user?.storeName} 통계 대시보드
      </h1>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <SummaryCard label="오늘 매출" value={formatWon(summary.totalSalesAmount)} />
        <SummaryCard label="오늘 주문 수" value={`${summary.orderCount}건`} />
        <SummaryCard label="방문자 수" value={`${summary.totalVisitors}명`} />
        <SummaryCard label="마감 예상 매출" value={formatWon(forecast.forecastClosingSalesAmount)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartSection
          title="시간대별 매출"
          details={
            <>
              <DetailRow
                label="피크 시간대"
                value={`${formatHour(peakSalesHour.hour)} · ${formatWon(peakSalesHour.salesAmount)}`}
              />
              <DetailRow
                label="최저 시간대"
                value={`${formatHour(lowSalesHour.hour)} · ${formatWon(lowSalesHour.salesAmount)}`}
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
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
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
                value={`${formatHour(peakVisitorHour.hour)} · ${peakVisitorHour.visitorCount}명`}
              />
              <DetailRow
                label="최저 시간대"
                value={`${formatHour(lowVisitorHour.hour)} · ${lowVisitorHour.visitorCount}명`}
              />
              <DetailRow label="총 방문자" value={`${hourlyVisitors.totalVisitors}명`} />
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
              <DetailRow label="지금까지 매출" value={formatWon(forecast.observedSalesAmount)} />
              <DetailRow label="마감 예상 매출" value={formatWon(forecast.forecastClosingSalesAmount)} />
            </>
          }
        >
          <BarChart
            data={[
              { label: '현재', amount: forecast.observedSalesAmount },
              { label: '마감 예상', amount: forecast.forecastClosingSalesAmount },
            ]}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6e6e73' }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip formatter={(value) => formatWon(Number(value))} />
            <Bar dataKey="amount" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>

        <ChartSection
          title="내일 방문자 예측"
          details={
            <>
              <DetailRow label="예상 방문자" value={`${tomorrow.expectedVisitors}명`} />
              <DetailRow label="대상일" value={tomorrow.targetDate} />
              <DetailRow label="오늘 대비" value={`${visitorGrowth >= 0 ? '+' : ''}${visitorGrowth}%`} />
            </>
          }
        >
          <BarChart data={[{ label: tomorrow.targetDate, visitors: tomorrow.expectedVisitors }]}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <Tooltip formatter={(value) => `${value}명`} />
            <Bar dataKey="visitors" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>
      </div>

      <div className="fixed bottom-8 left-[calc(50%+120px)] w-full max-w-md -translate-x-1/2 px-4">
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
