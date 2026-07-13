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

const totalSales = hourlyData.reduce((sum, d) => sum + d.sales, 0)
const totalVisitors = hourlyData.reduce((sum, d) => sum + d.visitors, 0)
const totalOrders = 96
const avgRating = 4.6

const peakSalesHour = hourlyData.reduce((a, b) => (b.sales > a.sales ? b : a))
const peakVisitorHour = hourlyData.reduce((a, b) => (b.visitors > a.visitors ? b : a))
const totalForecast = forecastData.reduce((sum, d) => sum + d.predicted, 0)

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-2xl font-medium text-gray-900">{value}</span>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-medium text-gray-900">가게 통계 대시보드</h1>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <SummaryCard label="오늘 매출" value={formatWon(totalSales)} />
        <SummaryCard label="오늘 주문 수" value={`${totalOrders}건`} />
        <SummaryCard label="방문자 수" value={`${totalVisitors}명`} />
        <SummaryCard label="평균 별점" value={avgRating.toFixed(1)} />
      </div>

      <div className="mb-4 flex items-stretch gap-4 rounded-lg border border-gray-200 p-5">
        <div className="flex w-48 shrink-0 flex-col justify-center gap-3 border-r border-gray-100 pr-5">
          <h2 className="text-base font-medium text-gray-900">시간대별 매출</h2>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">피크 시간대</span>
            <span className="text-lg font-medium text-gray-900">{peakSalesHour.hour}</span>
            <span className="text-sm text-gray-500">{formatWon(peakSalesHour.sales)}</span>
          </div>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hourlyData}>
              <CartesianGrid stroke="#e5e4e7" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b6375' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b6375' }}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip formatter={(value) => formatWon(Number(value))} />
              <Line type="monotone" dataKey="sales" stroke="#aa3bff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-4 flex items-stretch gap-4 rounded-lg border border-gray-200 p-5">
        <div className="flex w-48 shrink-0 flex-col justify-center gap-3 border-r border-gray-100 pr-5">
          <h2 className="text-base font-medium text-gray-900">시간대별 방문자</h2>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">피크 시간대</span>
            <span className="text-lg font-medium text-gray-900">{peakVisitorHour.hour}</span>
            <span className="text-sm text-gray-500">{peakVisitorHour.visitors}명</span>
          </div>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <CartesianGrid stroke="#e5e4e7" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b6375' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b6375' }} />
              <Tooltip formatter={(value) => `${value}명`} />
              <Bar dataKey="visitors" fill="#c084fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-stretch gap-4 rounded-lg border border-gray-200 p-5">
        <div className="flex w-48 shrink-0 flex-col justify-center gap-3 border-r border-gray-100 pr-5">
          <h2 className="text-base font-medium text-gray-900">마감 매출 예측</h2>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">22~00시 예상 합계</span>
            <span className="text-lg font-medium text-gray-900">{formatWon(totalForecast)}</span>
          </div>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={forecastData}>
              <CartesianGrid stroke="#e5e4e7" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b6375' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b6375' }}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip formatter={(value) => formatWon(Number(value))} />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#aa3bff"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
