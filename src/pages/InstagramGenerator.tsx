import { useState } from 'react'
import { ChevronLeft, ImagePlus, Plus, Sparkles, X } from 'lucide-react'
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

function buildCaptionOptions(keyword: string): string[] {
  return CAPTION_TEMPLATES.map((template) => template(keyword))
}

const DEFAULT_KEYWORD = '오늘의 신메뉴'

type Post = {
  id: string
  keyword: string
  imageUrl: string | null
  captionOptions: string[]
  hashtags: string[]
}

function createPost(keyword: string, imageUrl: string | null): Post {
  return {
    id: crypto.randomUUID(),
    keyword,
    imageUrl,
    captionOptions: buildCaptionOptions(keyword),
    hashtags: buildHashtags(keyword),
  }
}

function PostCard({ post }: { post: Post }) {
  return (
    <div className="rounded-[18px] border border-[#e0e0e0] bg-white">
      <div className="border-b border-[#f0f0f0] px-6 py-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
          {post.keyword}
        </h2>
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-[14px] bg-[#f0f0f0]">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.keyword} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#9a9a9e]">
              <ImagePlus size={24} strokeWidth={1.5} />
              <span className="text-[12px]">사진 없음</span>
            </div>
          )}
        </div>

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

        <div>
          <p className="mb-2 text-[12px] font-medium text-[#6e6e73]">추천 캡션</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {post.captionOptions.map((caption, index) => (
              <div
                key={index}
                className="w-64 shrink-0 rounded-[14px] border border-[#e0e0e0] bg-[#fafafc] p-4"
              >
                <p className="whitespace-pre-line text-[14px] leading-[1.5] text-[#1d1d1f]">
                  {caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatePostDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (keyword: string, imageUrl: string | null) => void
}) {
  const [step, setStep] = useState<'keyword' | 'photo'>('keyword')
  const [keyword, setKeyword] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  function handleKeywordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim()) return
    setStep('photo')
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUrl(URL.createObjectURL(file))
  }

  function handleFinish() {
    onCreate(keyword.trim(), imageUrl)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 flex h-svh w-full max-w-md flex-col bg-white shadow-[-24px_0_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          {step === 'photo' ? (
            <button
              type="button"
              onClick={() => setStep('keyword')}
              className="flex items-center gap-1 text-[14px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
            >
              <ChevronLeft size={16} />
              이전
            </button>
          ) : (
            <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              새 게시글 만들기
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6e6e73] transition-colors hover:bg-[#f5f5f7]"
          >
            <X size={18} />
          </button>
        </div>

        {step === 'keyword' && (
          <form onSubmit={handleKeywordSubmit} className="flex flex-1 flex-col px-6 py-6">
            <h3 className="mb-1 text-[19px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              어떤 내용의 게시글을 만들까요?
            </h3>
            <p className="mb-5 text-[14px] text-[#6e6e73]">
              홍보하고 싶은 메뉴나 키워드를 알려주세요.
            </p>
            <input
              type="text"
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예) 매운 떡볶이, 신메뉴 김밥"
              className="rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
            />
            <button
              type="submit"
              disabled={!keyword.trim()}
              className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              다음
            </button>
          </form>
        )}

        {step === 'photo' && (
          <div className="flex flex-1 flex-col px-6 py-6">
            <h3 className="mb-1 text-[19px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              사진을 올려주세요
            </h3>
            <p className="mb-5 text-[14px] text-[#6e6e73]">1:1 비율 사진이 가장 잘 어울려요.</p>

            <label className="flex aspect-square w-full max-w-[280px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-dashed border-[#c7c7cc] bg-[#fafafc] text-[#9a9a9e] transition-colors hover:bg-[#f0f0f0]">
              {imageUrl ? (
                <img src={imageUrl} alt="업로드한 사진" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} strokeWidth={1.5} />
                  <span className="text-[12px]">1:1 사진 업로드</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleFinish}
              className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Sparkles size={16} strokeWidth={1.75} />
              게시글 생성하기
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function InstagramGenerator() {
  const [posts, setPosts] = useState<Post[]>(() => [createPost(DEFAULT_KEYWORD, null)])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  function handleCreate(keyword: string, imageUrl: string | null) {
    setPosts((prev) => [createPost(keyword, imageUrl), ...prev])
    setIsDrawerOpen(false)
  }

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8 pb-24">
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        인스타그램 홍보 게시글 생성기
      </h1>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        키워드를 입력하고 사진을 올리면 캡션과 해시태그를 만들어드려요.
      </p>

      <div className="flex max-w-xl flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        aria-label="새 게시글 생성"
        className="fixed right-8 bottom-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-90"
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      {isDrawerOpen && (
        <CreatePostDrawer onClose={() => setIsDrawerOpen(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}

export default InstagramGenerator
