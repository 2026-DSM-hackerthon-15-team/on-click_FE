import { useState } from 'react'
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ImagePlus,
  Plus,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../authStore'
import {
  buildInstagramOAuthUrl,
  clearInstagramConnection,
  getInstagramConnection,
  isMetaAppConfigured,
  type InstagramConnection,
} from '../instagramAuth'

function buildCaptionOptions(keyword: string, storeName: string): string[] {
  return [
    `${storeName}에서 준비한 ${keyword}, 오늘도 정성 가득 담았어요 🍽️\n지금 바로 매장에서 만나보세요!`,
    `${keyword} 한 입에 행복이 몰려와요 😊\n${storeName}에서 특별한 오늘을 만들어보세요.`,
    `놓치면 아쉬운 ${storeName}의 ${keyword}!\n방문 전 미리 확인하고 오시면 더 좋아요 ✨`,
  ]
}

const HASHTAG_POOL = [
  '#맛집', '#맛스타그램', '#오늘뭐먹지', '#존맛탱', '#분식스타그램',
  '#로컬맛집', '#찐맛집', '#먹스타그램', '#데일리', '#오늘의메뉴',
]

function buildHashtags(keyword: string, storeName: string): string[] {
  const keywordTag = `#${keyword.replace(/\s+/g, '')}`
  return [keywordTag, `#${storeName.replace(/\s+/g, '')}`, ...HASHTAG_POOL.slice(0, 6)]
}

const DEFAULT_KEYWORD = '오늘의 신메뉴'

type PostStatus = 'pending' | 'approved' | 'rejected'

type Post = {
  id: string
  keyword: string
  designOptions: string[]
  selectedDesignIndex: number
  captionOptions: string[]
  hashtags: string[]
  status: PostStatus
  createdAt: string
  publishedAt: string | null
}

function createPost(keyword: string, designOptions: string[], storeName: string): Post {
  return {
    id: crypto.randomUUID(),
    keyword,
    designOptions,
    selectedDesignIndex: 0,
    captionOptions: buildCaptionOptions(keyword, storeName),
    hashtags: buildHashtags(keyword, storeName),
    status: 'pending',
    createdAt: new Date().toISOString(),
    publishedAt: null,
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}

function StatusBadge({ status }: { status: PostStatus }) {
  if (status === 'approved') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#e6f4ea] px-2.5 py-1 text-[12px] font-medium text-[#1e8e3e]">
        <Check size={12} strokeWidth={2.5} />
        승인됨
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#fce8e6] px-2.5 py-1 text-[12px] font-medium text-[#d93025]">
        <X size={12} strokeWidth={2.5} />
        반려됨
      </span>
    )
  }
  return (
    <span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[12px] font-medium text-[#6e6e73]">
      승인 대기
    </span>
  )
}

function InstagramConnectionBanner({
  connection,
  onDisconnect,
}: {
  connection: InstagramConnection | null
  onDisconnect: () => void
}) {
  if (connection) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-[18px] border border-[#e0e0e0] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Camera size={20} className="text-[#0066cc]" strokeWidth={1.75} />
          <div>
            <p className="text-[14px] font-medium text-[#1d1d1f]">인스타그램 연동됨</p>
            <p className="text-[12px] text-[#6e6e73]">@{connection.username}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDisconnect}
          className="rounded-full border border-[#e0e0e0] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        >
          연동 해제
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-[18px] border border-[#e0e0e0] bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <Camera size={20} className="text-[#9a9a9e]" strokeWidth={1.75} />
        <div>
          <p className="text-[14px] font-medium text-[#1d1d1f]">인스타그램이 연동되어 있지 않아요</p>
          <p className="text-[12px] text-[#6e6e73]">
            {isMetaAppConfigured()
              ? '연동하면 승인된 게시글을 바로 게시할 수 있어요.'
              : 'VITE_META_APP_ID 환경변수를 설정하면 연동할 수 있어요.'}
          </p>
        </div>
      </div>
      <a
        href={buildInstagramOAuthUrl()}
        aria-disabled={!isMetaAppConfigured()}
        className={`rounded-full px-4 py-2 text-[13px] font-medium text-white no-underline transition-opacity hover:opacity-90 ${
          isMetaAppConfigured() ? 'bg-[#0066cc]' : 'pointer-events-none bg-[#c7c7cc]'
        }`}
      >
        인스타그램 연결하기
      </a>
    </div>
  )
}

function PostCard({
  post,
  isInstagramConnected,
  onApprove,
  onReject,
  onPublish,
  onSelectDesign,
}: {
  post: Post
  isInstagramConnected: boolean
  onApprove: () => void
  onReject: () => void
  onPublish: () => void
  onSelectDesign: (index: number) => void
}) {
  const selectedDesign = post.designOptions[post.selectedDesignIndex]

  return (
    <div className="rounded-[18px] border border-[#e0e0e0] bg-white">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
            {post.keyword}
          </h2>
          <p className="text-[12px] text-[#6e6e73]">
            {formatDateTime(post.createdAt)} 생성
            {post.publishedAt && ` · ${formatDateTime(post.publishedAt)} 게시`}
          </p>
        </div>
        <StatusBadge status={post.status} />
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-[14px] bg-[#f0f0f0]">
          {selectedDesign ? (
            <img src={selectedDesign} alt={post.keyword} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#9a9a9e]">
              <ImagePlus size={24} strokeWidth={1.5} />
              <span className="text-[12px]">사진 없음</span>
            </div>
          )}
        </div>

        {post.designOptions.length > 1 && (
          <div>
            <p className="mb-2 text-[12px] font-medium text-[#6e6e73]">디자인 시안 선택</p>
            <div className="flex gap-2">
              {post.designOptions.map((design, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectDesign(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border-2 ${
                    index === post.selectedDesignIndex ? 'border-[#0066cc]' : 'border-transparent'
                  }`}
                >
                  <img src={design} alt={`시안 ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

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

        <div className="flex items-center gap-2 border-t border-[#f0f0f0] pt-4">
          {post.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={onApprove}
                className="flex items-center gap-1.5 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                <CheckCircle2 size={15} strokeWidth={2} />
                승인
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                <XCircle size={15} strokeWidth={2} />
                반려
              </button>
            </>
          )}
          {post.status === 'approved' && !post.publishedAt && (
            <button
              type="button"
              onClick={onPublish}
              disabled={!isInstagramConnected}
              className="flex items-center gap-1.5 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Camera size={15} strokeWidth={2} />
              {isInstagramConnected ? '인스타그램에 게시' : '인스타그램 연동 필요'}
            </button>
          )}
          {post.publishedAt && (
            <span className="text-[13px] text-[#1e8e3e]">인스타그램에 게시 완료</span>
          )}
        </div>
      </div>
    </div>
  )
}

const DESIGN_COUNT = 3

function CreatePostDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (keyword: string, designOptions: string[]) => void
}) {
  const [step, setStep] = useState<'keyword' | 'photo'>('keyword')
  const [keyword, setKeyword] = useState('')
  const [designOptions, setDesignOptions] = useState<string[]>([])

  function handleKeywordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim()) return
    setStep('photo')
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, DESIGN_COUNT)
    if (files.length === 0) return
    setDesignOptions(files.map((file) => URL.createObjectURL(file)))
  }

  function handleFinish() {
    onCreate(keyword.trim(), designOptions)
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
            <p className="mb-5 text-[14px] text-[#6e6e73]">
              1:1 비율 사진을 최대 {DESIGN_COUNT}장까지 올리면 여러 디자인 시안으로 만들어드려요.
            </p>

            <label className="flex aspect-square w-full max-w-[280px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-dashed border-[#c7c7cc] bg-[#fafafc] text-[#9a9a9e] transition-colors hover:bg-[#f0f0f0]">
              {designOptions.length > 0 ? (
                <img src={designOptions[0]} alt="업로드한 사진" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} strokeWidth={1.5} />
                  <span className="text-[12px]">1:1 사진 업로드 (여러 장 가능)</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {designOptions.length > 1 && (
              <div className="mt-3 flex gap-2">
                {designOptions.map((design, index) => (
                  <div key={index} className="h-14 w-14 overflow-hidden rounded-[8px]">
                    <img src={design} alt={`시안 ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

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
  const { user } = useAuth()
  const storeName = user?.storeName ?? ''
  const [posts, setPosts] = useState<Post[]>(() => [createPost(DEFAULT_KEYWORD, [], storeName)])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [connection, setConnection] = useState<InstagramConnection | null>(() =>
    getInstagramConnection(),
  )

  function handleCreate(keyword: string, designOptions: string[]) {
    setPosts((prev) => [createPost(keyword, designOptions, storeName), ...prev])
    setIsDrawerOpen(false)
  }

  function updatePost(id: string, updates: Partial<Post>) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  function handleDisconnect() {
    clearInstagramConnection()
    setConnection(null)
  }

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8 pb-24">
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        인스타그램 홍보 게시글 생성기
      </h1>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        키워드를 입력하고 사진을 올리면 캡션과 해시태그를 만들어드려요.
      </p>

      <div className="max-w-xl">
        <InstagramConnectionBanner connection={connection} onDisconnect={handleDisconnect} />
      </div>

      <div className="flex max-w-xl flex-col gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isInstagramConnected={!!connection}
            onApprove={() => updatePost(post.id, { status: 'approved' })}
            onReject={() => updatePost(post.id, { status: 'rejected' })}
            onPublish={() => updatePost(post.id, { publishedAt: new Date().toISOString() })}
            onSelectDesign={(index) => updatePost(post.id, { selectedDesignIndex: index })}
          />
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
