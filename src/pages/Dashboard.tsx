import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { STORE_NAME } from '../constants'
import { useChat } from '../chatStore'
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

const hourlyData = [
  { hour: '09시', sales: 42000, visitors: 8 },
  { hour: '10시', sales: 68000, visitors: 14 },
  { hour: '11시', sales: 125000, visitors: 22 },
  { hour: '12시', sales: 310000, visitors: 51 },
  { hour: '13시', sales: 284000, visitors: 47 },
  { hour: '14시', sales: 96000, visitors: 19 },
  { hour: '15시', sales: 71000, visitors: 15 },
  { hour: '16시', sales: 88000, visitors: 17 },
  { hour: '17시', sales: 132000, visitors: 24 },
  { hour: '18시', sales: 256000, visitors: 43 },
  { hour: '19시', sales: 298000, visitors: 49 },
  { hour: '20시', sales: 187000, visitors: 31 },
  { hour: '21시', sales: 94000, visitors: 16 },
]

const forecastData = [
  { hour: '22시', predicted: 52000 },
  { hour: '23시', predicted: 21000 },
  { hour: '00시', predicted: 8000 },
]

const tomorrowVisitorForecast = [
  { hour: '09시', visitors: 9 },
  { hour: '11시', visitors: 24 },
  { hour: '13시', visitors: 49 },
  { hour: '15시', visitors: 18 },
  { hour: '17시', visitors: 26 },
  { hour: '19시', visitors: 52 },
  { hour: '21시', visitors: 17 },
]

const totalSales = hourlyData.reduce((sum, d) => sum + d.sales, 0)
const totalVisitors = hourlyData.reduce((sum, d) => sum + d.visitors, 0)
const totalOrders = 96
const avgRating = 4.6

const peakSalesHour = hourlyData.reduce((a, b) => (b.sales > a.sales ? b : a))
const lowSalesHour = hourlyData.reduce((a, b) => (b.sales < a.sales ? b : a))
const peakVisitorHour = hourlyData.reduce((a, b) => (b.visitors > a.visitors ? b : a))
const lowVisitorHour = hourlyData.reduce((a, b) => (b.visitors < a.visitors ? b : a))
const avgSales = Math.round(totalSales / hourlyData.length)
const tomorrowTotalVisitors = tomorrowVisitorForecast.reduce((sum, d) => sum + d.visitors, 0)
const tomorrowPeakHour = tomorrowVisitorForecast.reduce((a, b) => (b.visitors > a.visitors ? b : a))
const visitorGrowth = Math.round(((tomorrowTotalVisitors - totalVisitors) / totalVisitors) * 100)

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
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
      <div className="flex flex-col gap-2 border-t border-[#f0f0f0] px-6 py-4">
        {details}
      </div>
    </section>
  )
}

function Dashboard() {
  const { sendMessage } = useChat()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return
    const conversationId = sendMessage(null, inputValue)
    setInputValue('')
    navigate(`/chat/${conversationId}`)
  }

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        {STORE_NAME} 통계 대시보드
      </h1>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <SummaryCard label="오늘 매출" value={formatWon(totalSales)} />
        <SummaryCard label="오늘 주문 수" value={`${totalOrders}건`} />
        <SummaryCard label="방문자 수" value={`${totalVisitors}명`} />
        <SummaryCard label="평균 별점" value={avgRating.toFixed(1)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartSection
          title="시간대별 매출"
          details={
            <>
              <DetailRow label="피크 시간대" value={`${peakSalesHour.hour} · ${formatWon(peakSalesHour.sales)}`} />
              <DetailRow label="최저 시간대" value={`${lowSalesHour.hour} · ${formatWon(lowSalesHour.sales)}`} />
              <DetailRow label="시간당 평균" value={formatWon(avgSales)} />
            </>
          }
        >
          <LineChart data={hourlyData}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6e6e73' }} interval={1} />
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
              <DetailRow label="피크 시간대" value={`${peakVisitorHour.hour} · ${peakVisitorHour.visitors}명`} />
              <DetailRow label="최저 시간대" value={`${lowVisitorHour.hour} · ${lowVisitorHour.visitors}명`} />
              <DetailRow label="총 방문자" value={`${totalVisitors}명`} />
            </>
          }
        >
          <BarChart data={hourlyData}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6e6e73' }} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <Tooltip formatter={(value) => `${value}명`} />
            <Bar dataKey="visitors" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>

        <ChartSection
          title="마감 매출 예측"
          details={
            <>
              {forecastData.map((d) => (
                <DetailRow key={d.hour} label={d.hour} value={formatWon(d.predicted)} />
              ))}
            </>
          }
        >
          <LineChart data={forecastData}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6e6e73' }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip formatter={(value) => formatWon(Number(value))} />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#0066cc"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartSection>

        <ChartSection
          title="내일 방문자 예측"
          details={
            <>
              <DetailRow label="예상 방문자" value={`${tomorrowTotalVisitors}명`} />
              <DetailRow label="피크 예상 시간대" value={`${tomorrowPeakHour.hour} · ${tomorrowPeakHour.visitors}명`} />
              <DetailRow label="오늘 대비" value={`${visitorGrowth >= 0 ? '+' : ''}${visitorGrowth}%`} />
            </>
          }
        >
          <BarChart data={tomorrowVisitorForecast}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <Tooltip formatter={(value) => `${value}명`} />
            <Bar dataKey="visitors" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartSection>
      </div>

      <div className="fixed bottom-8 left-[calc(50%+120px)] w-full max-w-md -translate-x-1/2 px-4">
        <form onSubmit={handleSubmit} className="rainbow-border rounded-full p-[4px] shadow-[0_40px_60px_-15px_rgba(0,0,0,0.7),0_60px_100px_-20px_rgba(0,0,0,0.5)]">
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
