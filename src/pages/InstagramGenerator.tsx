import { useEffect, useState } from 'react'
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
import { getInstagramAccount, registerInstagramAccount } from '../api/instagram'
import {
  approveMarketing,
  createMarketing,
  listMarketings,
  type CreateMarketingRequest,
  type Marketing,
} from '../api/marketing'
import { uploadMedia } from '../api/media'
import { listProducts, type Product } from '../api/products'
import { getApiErrorMessage } from '../api/client'

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}

function StatusBadge({ status }: { status: Marketing['status'] }) {
  if (status === 'APPROVED' || status === 'PUBLISHED') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#e6f4ea] px-2.5 py-1 text-[12px] font-medium text-[#1e8e3e]">
        <Check size={12} strokeWidth={2.5} />
        {status === 'PUBLISHED' ? '게시 완료' : '승인됨'}
      </span>
    )
  }
  if (status === 'FAILED') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#fce8e6] px-2.5 py-1 text-[12px] font-medium text-[#d93025]">
        <X size={12} strokeWidth={2.5} />
        게시 실패
      </span>
    )
  }
  return (
    <span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[12px] font-medium text-[#6e6e73]">
      승인 대기
    </span>
  )
}

function InstagramAccountBanner({ storeId }: { storeId: number }) {
  const [accountId, setAccountId] = useState('')
  const [password, setPassword] = useState('')
  const [connected, setConnected] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getInstagramAccount(storeId)
      .then((account) => setConnected(account.accountId))
      .catch(() => setConnected(null))
  }, [storeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await registerInstagramAccount(storeId, accountId, password)
      setConnected(accountId)
      setIsEditing(false)
      setPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, '인스타그램 계정 등록에 실패했어요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (connected && !isEditing) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-[18px] border border-[#e0e0e0] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Camera size={20} className="text-[#0066cc]" strokeWidth={1.75} />
          <div>
            <p className="text-[14px] font-medium text-[#1d1d1f]">인스타그램 계정 등록됨</p>
            <p className="text-[12px] text-[#6e6e73]">@{connected}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full border border-[#e0e0e0] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        >
          계정 교체
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex items-center gap-3 rounded-[18px] border border-[#e0e0e0] bg-white px-6 py-4"
    >
      <Camera size={20} className="shrink-0 text-[#9a9a9e]" strokeWidth={1.75} />
      <input
        type="text"
        required
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        placeholder="인스타그램 아이디"
        className="w-40 rounded-lg border border-[#e0e0e0] px-3 py-2 text-[13px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        className="w-40 rounded-lg border border-[#e0e0e0] px-3 py-2 text-[13px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="ml-auto rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? '등록 중...' : '계정 등록'}
      </button>
      {error && <p className="text-[12px] text-[#ff3b30]">{error}</p>}
    </form>
  )
}

function PostCard({
  post,
  onApprove,
}: {
  post: Marketing
  onApprove: () => void
}) {
  const imageUrl = post.media[0]?.url ?? null

  return (
    <div className="rounded-[18px] border border-[#e0e0e0] bg-white">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
            {post.title || '(제목 없음)'}
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
          {imageUrl ? (
            <img src={imageUrl} alt={post.title} className="h-full w-full object-cover" />
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

        <p className="whitespace-pre-line text-[14px] leading-[1.5] text-[#1d1d1f]">
          {post.content}
        </p>

        {post.status === 'FAILED' && post.failureReason && (
          <p className="text-[13px] text-[#ff3b30]">실패 사유: {post.failureReason}</p>
        )}

        <div className="flex items-center gap-2 border-t border-[#f0f0f0] pt-4">
          {post.status === 'DRAFT' && (
            <button
              type="button"
              onClick={onApprove}
              className="flex items-center gap-1.5 rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <CheckCircle2 size={15} strokeWidth={2} />
              승인
            </button>
          )}
          {post.status === 'FAILED' && (
            <button
              type="button"
              onClick={onApprove}
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            >
              <XCircle size={15} strokeWidth={2} />
              다시 승인 요청
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const TONE_OPTIONS = ['친근한 말투', '전문적인 말투', '재치있는 말투', '감성적인 말투']

function CreatePostDrawer({
  storeId,
  onClose,
  onCreated,
}: {
  storeId: number
  onClose: () => void
  onCreated: (marketing: Marketing) => void
}) {
  const [step, setStep] = useState<'info' | 'photo'>('info')
  const [products, setProducts] = useState<Product[]>([])
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [promotion, setPromotion] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [tone, setTone] = useState('')
  const [additionalRequest, setAdditionalRequest] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listProducts(storeId).then(setProducts)
  }, [storeId])

  function selectProduct(product: Product) {
    setProductName(product.name)
    setPrice(String(product.price))
  }

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productName.trim() || !description.trim()) return
    setStep('photo')
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleFinish() {
    if (!imageFile) return
    setIsSubmitting(true)
    setError('')
    try {
      const media = await uploadMedia(storeId, imageFile)
      const payload: CreateMarketingRequest = {
        productName: productName.trim(),
        description: description.trim(),
        mediaIds: [media.mediaId],
      }
      if (price) payload.price = Number(price)
      if (promotion.trim()) payload.promotion = promotion.trim()
      if (targetAudience.trim()) payload.targetAudience = targetAudience.trim()
      if (tone) payload.tone = tone
      if (additionalRequest.trim()) payload.additionalRequest = additionalRequest.trim()

      const marketing = await createMarketing(storeId, payload)
      onCreated(marketing)
    } catch (err) {
      setError(getApiErrorMessage(err, '게시글 생성에 실패했어요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 flex h-svh w-full max-w-md flex-col overflow-y-auto bg-white shadow-[-24px_0_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          {step === 'photo' ? (
            <button
              type="button"
              onClick={() => setStep('info')}
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

        {step === 'info' && (
          <form onSubmit={handleInfoSubmit} className="flex flex-1 flex-col px-6 py-6">
            <h3 className="mb-1 text-[19px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              어떤 메뉴를 홍보할까요?
            </h3>
            <p className="mb-3 text-[14px] text-[#6e6e73]">
              등록된 메뉴를 누르면 이름과 가격이 자동으로 채워져요.
            </p>

            {products.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => selectProduct(product)}
                    className="rounded-full border border-[#e0e0e0] px-3 py-1.5 text-[13px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">메뉴 이름 *</span>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예) 매운 떡볶이"
                  className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">메뉴 설명 *</span>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예) 매콤한 소스와 쫄깃한 떡이 특징인 인기 메뉴"
                  rows={3}
                  className="resize-none rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">가격</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="예) 5000"
                  className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">프로모션</span>
                <input
                  type="text"
                  value={promotion}
                  onChange={(e) => setPromotion(e.target.value)}
                  placeholder="예) 오후 2시 이후 10% 할인"
                  className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">타깃 고객</span>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예) 직장인"
                  className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">말투</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                >
                  <option value="">선택 안 함</option>
                  {TONE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6e6e73]">추가 요청사항</span>
                <input
                  type="text"
                  value={additionalRequest}
                  onChange={(e) => setAdditionalRequest(e.target.value)}
                  placeholder="예) 여름 분위기를 강조해줘"
                  className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0066cc]"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!productName.trim() || !description.trim()}
              className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
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
              {previewUrl ? (
                <img src={previewUrl} alt="업로드한 사진" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} strokeWidth={1.5} />
                  <span className="text-[12px]">1:1 사진 업로드</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {error && <p className="mt-3 text-[13px] text-[#ff3b30]">{error}</p>}

            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting || !imageFile}
              className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles size={16} strokeWidth={1.75} />
              {isSubmitting ? '생성 중...' : '게시글 생성하기'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function InstagramGenerator() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Marketing[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    listMarketings(user.storeId)
      .then(setPosts)
      .catch((e) => setError(getApiErrorMessage(e, '게시글 목록을 불러오지 못했어요.')))
  }, [user])

  async function handleApprove(marketingId: number) {
    if (!user) return
    try {
      const updated = await approveMarketing(user.storeId, marketingId)
      setPosts((prev) => prev.map((p) => (p.marketingId === marketingId ? updated : p)))
    } catch (e) {
      setError(getApiErrorMessage(e, '승인 요청에 실패했어요.'))
    }
  }

  if (!user) return null

  return (
    <div className="min-h-full bg-[#f5f5f7] p-8 pb-24">
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.28px] text-[#1d1d1f]">
        인스타그램 홍보 게시글 생성기
      </h1>
      <p className="mb-6 text-[15px] text-[#6e6e73]">
        메뉴 정보와 사진을 입력하면 AI가 캡션과 해시태그를 만들어드려요.
      </p>

      <div className="max-w-xl">
        <InstagramAccountBanner storeId={user.storeId} />
      </div>

      {error && <p className="mb-4 max-w-xl text-[13px] text-[#ff3b30]">{error}</p>}

      <div className="flex max-w-xl flex-col gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.marketingId}
            post={post}
            onApprove={() => handleApprove(post.marketingId)}
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
        <CreatePostDrawer
          storeId={user.storeId}
          onClose={() => setIsDrawerOpen(false)}
          onCreated={(marketing) => {
            setPosts((prev) => [marketing, ...prev])
            setIsDrawerOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default InstagramGenerator
