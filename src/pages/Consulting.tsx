import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { useAuth } from '../authStore'

type ConsultingReport = {
  date: string
  dateLabel: string
  insights: { title: string; body: string }[]
  actionItems: string[]
}

function formatDateLabel(daysAgo: number): { date: string; dateLabel: string } {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const date = d.toISOString().slice(0, 10)
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일`
  return { date, dateLabel }
}

const REPORTS: ConsultingReport[] = [
  {
    ...formatDateLabel(0),
    insights: [
      {
        title: '피크 시간대 인력 배치',
        body: '12시~13시, 19시 전후로 매출과 방문자가 몰려요. 해당 시간대에 인력을 한 명 더 배치하면 대기 시간을 줄이고 놓치는 주문을 막을 수 있어요.',
      },
      {
        title: '오전 시간대 프로모션',
        body: '09시~10시는 하루 중 가장 한산한 시간이에요. 오픈 할인이나 세트 메뉴 프로모션으로 방문을 유도해보세요.',
      },
      {
        title: '내일 방문자 감소 대비',
        body: '내일은 오늘 대비 방문자가 줄어들 것으로 예상돼요. 재료 발주량을 조정하고, 필요하다면 SNS 홍보로 방문을 유도해보세요.',
      },
      {
        title: '별점 관리',
        body: '평균 별점 4.6점으로 안정적이에요. 최근 리뷰에서 반복적으로 언급되는 메뉴가 있다면 시그니처로 강조하는 것도 좋아요.',
      },
    ],
    actionItems: [
      '피크 시간대(12~13시, 19시) 인력 1명 추가 배치',
      '오전 방문 유도용 할인 프로모션 검토',
      '내일 방문자 감소 대비 재료 발주량 조정',
      '리뷰에서 반복 언급되는 메뉴 SNS 홍보 소재로 활용',
    ],
  },
  {
    ...formatDateLabel(1),
    insights: [
      {
        title: '주말 대비 재고 준비',
        body: '주말 방문자가 평일보다 20% 많았어요. 인기 메뉴 재료를 여유 있게 준비해두세요.',
      },
      {
        title: '배달 주문 비중 증가',
        body: '배달 주문 비중이 늘고 있어요. 포장 용기와 배달 전용 메뉴 구성을 점검해보세요.',
      },
      {
        title: '저녁 시간대 회전율',
        body: '저녁 시간대 테이블 회전율이 다소 낮아요. 좌석 배치를 조정하면 효율을 높일 수 있어요.',
      },
      {
        title: '신규 방문자 비중',
        body: '신규 방문자 비중이 늘었어요. 첫 방문 고객 대상 쿠폰 발급을 고려해보세요.',
      },
    ],
    actionItems: [
      '인기 메뉴 재료 여유분 확보',
      '배달 전용 메뉴 및 포장 용기 점검',
      '저녁 시간대 좌석 배치 조정',
      '신규 방문자 대상 쿠폰 발급 검토',
    ],
  },
  {
    ...formatDateLabel(2),
    insights: [
      {
        title: '날씨에 따른 매출 변동',
        body: '비 오는 날 방문자가 15% 감소했어요. 우천 시 배달 프로모션을 준비해보세요.',
      },
      {
        title: '재구매율',
        body: '재방문 고객 비중이 꾸준히 유지되고 있어요. 단골 대상 적립 혜택을 강화해보세요.',
      },
      {
        title: '메뉴별 마진',
        body: '일부 메뉴의 원가 비중이 높아졌어요. 가격 조정 또는 대체 재료를 검토해보세요.',
      },
      {
        title: '리뷰 응답률',
        body: '최근 리뷰에 대한 답글 비율이 낮아요. 답글을 남기면 신뢰도 향상에 도움이 돼요.',
      },
    ],
    actionItems: [
      '우천 시 배달 프로모션 준비',
      '단골 고객 적립 혜택 강화',
      '원가 비중 높은 메뉴 가격/재료 검토',
      '최근 리뷰에 답글 작성',
    ],
  },
]

function ConsultingList() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={20} className="text-[#0066cc]" strokeWidth={1.75} />
        <h1 className="text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
          컨설팅 리포트
        </h1>
      </div>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        {user?.storeName}의 날짜별 운영 컨설팅 기록이에요.
      </p>

      <div className="flex flex-col gap-3">
        {REPORTS.map((report, index) => (
          <button
            key={report.date}
            type="button"
            onClick={() => navigate(`/consulting/${report.date}`)}
            className="flex items-center justify-between rounded-[18px] border border-[#e0e0e0] bg-white px-6 py-5 text-left transition-colors hover:bg-[#fafafc]"
          >
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
                {report.dateLabel} {index === 0 ? '(오늘)' : ''}
              </h2>
              <p className="mt-1 text-[13px] text-[#6e6e73]">
                {report.insights[0].title} 외 {report.insights.length - 1}건
              </p>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-[#c7c7cc]" />
          </button>
        ))}
      </div>
    </div>
  )
}

function ConsultingDetail() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const report = REPORTS.find((r) => r.date === date)

  if (!report) {
    return (
      <div className="min-h-full bg-[#f5f5f7] p-8">
        <p className="text-[15px] text-[#6e6e73]">해당 날짜의 리포트를 찾을 수 없어요.</p>
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
          {report.dateLabel} 컨설팅 리포트
        </h1>
      </div>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        {user?.storeName}의 운영 데이터를 바탕으로 한 맞춤 제안이에요.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {report.insights.map((insight) => (
          <div key={insight.title} className="rounded-[18px] border border-[#e0e0e0] bg-white p-6">
            <h2 className="mb-2 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              {insight.title}
            </h2>
            <p className="text-[14px] leading-[1.6] text-[#6e6e73]">{insight.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[18px] border border-[#e0e0e0] bg-white p-6">
        <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
          이 날의 액션 아이템
        </h2>
        <ul className="flex flex-col gap-2">
          {report.actionItems.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[14px] text-[#1d1d1f]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066cc]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { ConsultingList, ConsultingDetail }
