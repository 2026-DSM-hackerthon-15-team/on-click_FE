import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { STORE_NAME } from '../constants'

const CAPTION_TEMPLATES = [
  (keyword: string) =>
    `${STORE_NAME}에서 준비한 ${keyword}, 오늘도 정성 가득 담았어요 🍽️\n지금 바로 매장에서 만나보세요!`,
  (keyword: string) =>
    `${keyword} 한 입에 행복이 몰려와요 😊\n${STORE_NAME}에서 특별한 오늘을 만들어보세요.`,
  (keyword: string) =>
    `놓치면 아쉬운 ${STORE_NAME}의 ${keyword}!\n방문 전 미리 확인하고 오시면 더 좋아요 ✨`,
]

const HASHTAG_POOL = [
  '#맛집', '#맛스타그램', '#오늘뭐먹지', '#존맛탱', '#분식스타그램',
  '#로컬맛집', '#찐맛집', '#먹스타그램', '#데일리', '#오늘의메뉴',
]

function buildHashtags(keyword: string): string[] {
  const keywordTag = `#${keyword.replace(/\s+/g, '')}`
  return [keywordTag, `#${STORE_NAME.replace(/\s+/g, '')}`, ...HASHTAG_POOL.slice(0, 6)]
}

type GeneratedPost = {
  caption: string
  hashtags: string[]
}

function InstagramGenerator() {
  const [keyword, setKeyword] = useState('')
  const [post, setPost] = useState<GeneratedPost | null>(null)

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = keyword.trim()
    if (!trimmed) return

    const template = CAPTION_TEMPLATES[Math.floor(Math.random() * CAPTION_TEMPLATES.length)]
    setPost({
      caption: template(trimmed),
      hashtags: buildHashtags(trimmed),
    })
  }

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8">
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        인스타그램 홍보 게시글 생성기
      </h1>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        오늘 홍보하고 싶은 메뉴나 키워드를 입력하면 캡션과 해시태그를 만들어드려요.
      </p>

      <form
        onSubmit={handleGenerate}
        className="mb-6 flex items-center gap-3 rounded-[18px] border border-[#e0e0e0] bg-white p-2 pl-5"
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="예) 매운 떡볶이, 신메뉴 김밥"
          className="w-full bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#9a9a9e]"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#0066cc] px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <Sparkles size={16} strokeWidth={1.75} />
          생성하기
        </button>
      </form>

      {post ? (
        <div className="max-w-xl rounded-[18px] border border-[#e0e0e0] bg-white">
          <div className="border-b border-[#f0f0f0] px-6 py-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              생성된 게시글
            </h2>
          </div>
          <div className="flex flex-col gap-4 px-6 py-5">
            <p className="whitespace-pre-line text-[15px] leading-[1.5] text-[#1d1d1f]">
              {post.caption}
            </p>
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f0f0f0] px-3 py-1 text-[13px] text-[#0066cc]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex max-w-xl flex-col items-center justify-center rounded-[18px] border border-dashed border-[#e0e0e0] bg-white px-6 py-12 text-center">
          <Sparkles size={24} className="mb-3 text-[#c7c7cc]" strokeWidth={1.5} />
          <p className="text-[14px] text-[#6e6e73]">키워드를 입력하고 생성하기를 눌러보세요.</p>
        </div>
      )}
    </div>
  )
}

export default InstagramGenerator
