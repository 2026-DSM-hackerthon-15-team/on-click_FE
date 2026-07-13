import { Sparkles } from 'lucide-react'
import { STORE_NAME } from '../constants'

const today = new Date()
const todayLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`

const insights = [
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
]

const actionItems = [
  '피크 시간대(12~13시, 19시) 인력 1명 추가 배치',
  '오전 방문 유도용 할인 프로모션 검토',
  '내일 방문자 감소 대비 재료 발주량 조정',
  '리뷰에서 반복 언급되는 메뉴 SNS 홍보 소재로 활용',
]

function Consulting() {
  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={20} className="text-[#0066cc]" strokeWidth={1.75} />
        <h1 className="text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
          오늘의 컨설팅 리포트
        </h1>
      </div>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        {todayLabel} · {STORE_NAME}의 운영 데이터를 바탕으로 한 맞춤 제안이에요.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="rounded-[18px] border border-[#e0e0e0] bg-white p-6"
          >
            <h2 className="mb-2 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              {insight.title}
            </h2>
            <p className="text-[14px] leading-[1.6] text-[#6e6e73]">{insight.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[18px] border border-[#e0e0e0] bg-white p-6">
        <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
          오늘의 액션 아이템
        </h2>
        <ul className="flex flex-col gap-2">
          {actionItems.map((item) => (
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

export default Consulting
