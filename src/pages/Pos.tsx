import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../authStore'
import {
  createProduct,
  listProducts,
  updateProduct,
  updateProductStatus,
  type Product,
} from '../api/products'
import { getApiErrorMessage } from '../api/client'

type CartLine = {
  product: Product
  quantity: number
}

type PaymentStage = 'waiting' | 'processing' | 'success'

const TAX_RATE = 0.1
const CARD_COLORS = [
  '#e8543c',
  '#f0a83a',
  '#7a1f3d',
  '#1e8e3e',
  '#0066cc',
  '#c2185b',
  '#5e35b1',
  '#00838f',
]

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

function colorForProduct(productId: number) {
  return CARD_COLORS[productId % CARD_COLORS.length]
}

function ManageProductsDrawer({
  storeId,
  products,
  onClose,
  onChange,
}: {
  storeId: number
  products: Product[]
  onClose: () => void
  onChange: (products: Product[]) => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price) return
    setIsSubmitting(true)
    setError('')
    try {
      const product = await createProduct(storeId, { name: name.trim(), price: Number(price) })
      onChange([...products, product])
      setName('')
      setPrice('')
    } catch (err) {
      setError(getApiErrorMessage(err, '메뉴 등록에 실패했어요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id)
    setEditName(product.name)
    setEditPrice(String(product.price))
  }

  async function handleSaveEdit(productId: number) {
    setError('')
    try {
      const updated = await updateProduct(storeId, productId, {
        name: editName.trim(),
        price: Number(editPrice),
      })
      onChange(products.map((p) => (p.id === productId ? updated : p)))
      setEditingId(null)
    } catch (err) {
      setError(getApiErrorMessage(err, '메뉴 수정에 실패했어요.'))
    }
  }

  async function handleToggleActive(product: Product) {
    setError('')
    try {
      const updated = await updateProductStatus(storeId, product.id, !product.active)
      onChange(products.map((p) => (p.id === product.id ? updated : p)))
    } catch (err) {
      setError(getApiErrorMessage(err, '판매 상태 변경에 실패했어요.'))
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 flex h-svh w-full max-w-md flex-col bg-white shadow-[-24px_0_60px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f]">메뉴 관리</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6e6e73] transition-colors hover:bg-[#f5f5f7]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2 border-b border-[#e5e5e5] px-6 py-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="메뉴 이름"
            className="flex-1 rounded-lg border border-[#e0e0e0] px-3 py-2 text-[13px] outline-none focus:border-[#0066cc]"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="가격"
            className="w-24 rounded-lg border border-[#e0e0e0] px-3 py-2 text-[13px] outline-none focus:border-[#0066cc]"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 rounded-lg bg-[#0066cc] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            등록
          </button>
        </form>

        {error && <p className="px-6 pt-3 text-[13px] text-[#ff3b30]">{error}</p>}

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                product.active ? 'border-[#e0e0e0]' : 'border-[#e0e0e0] bg-[#f5f5f7] opacity-60'
              }`}
            >
              {editingId === product.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-24 rounded border border-[#e0e0e0] px-2 py-1 text-[13px] outline-none"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-20 rounded border border-[#e0e0e0] px-2 py-1 text-[13px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(product.id)}
                    className="ml-auto rounded bg-[#0066cc] px-3 py-1 text-[12px] font-medium text-white"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded border border-[#e0e0e0] px-3 py-1 text-[12px]"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[14px] text-[#1d1d1f]">{product.name}</span>
                  <span className="text-[13px] text-[#6e6e73]">{formatWon(product.price)}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    aria-label="수정"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#6e6e73] hover:bg-[#f5f5f7]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product)}
                    aria-label={product.active ? '판매 중지' : '판매 재개'}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#6e6e73] hover:bg-[#f5f5f7]"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-[13px] text-[#9a9a9e]">등록된 메뉴가 없어요.</p>
          )}
        </div>
      </div>
    </>
  )
}

function PaymentModal({
  total,
  stage,
  onClose,
}: {
  total: number
  stage: PaymentStage
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[20px] bg-white px-8 py-10 text-center">
        {stage === 'waiting' && (
          <>
            <CreditCard size={40} className="text-[#0066cc]" strokeWidth={1.5} />
            <div>
              <p className="text-[17px] font-semibold text-[#1d1d1f]">카드를 리더기에 꽂아주세요</p>
              <p className="mt-1 text-[14px] text-[#6e6e73]">결제 금액 {formatWon(total)}</p>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[#0066cc]" />
            </div>
          </>
        )}
        {stage === 'processing' && (
          <>
            <Loader2 size={40} className="animate-spin text-[#0066cc]" strokeWidth={1.5} />
            <div>
              <p className="text-[17px] font-semibold text-[#1d1d1f]">결제 처리 중이에요</p>
              <p className="mt-1 text-[14px] text-[#6e6e73]">잠시만 기다려주세요</p>
            </div>
          </>
        )}
        {stage === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-[#1e8e3e]" strokeWidth={1.5} />
            <div>
              <p className="text-[17px] font-semibold text-[#1d1d1f]">결제가 완료됐어요</p>
              <p className="mt-1 text-[14px] text-[#6e6e73]">{formatWon(total)} 결제 승인</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[#0066cc] py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              확인
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Pos() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [isManaging, setIsManaging] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'popular'>('all')
  const [orderNumber, setOrderNumber] = useState(1)
  const [paymentStage, setPaymentStage] = useState<PaymentStage | null>(null)

  useEffect(() => {
    if (!user) return
    listProducts(user.storeId)
      .then(setProducts)
      .catch((e) => setError(getApiErrorMessage(e, '메뉴를 불러오지 못했어요.')))
  }, [user])

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id)
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function changeQuantity(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.product.id === productId ? { ...line, quantity: line.quantity + delta } : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }

  function clearCart() {
    setCart([])
  }

  const activeProducts = products.filter((p) => p.active)
  const popularProducts = useMemo(
    () => [...activeProducts].sort((a, b) => b.price - a.price).slice(0, 4),
    [activeProducts],
  )
  const visibleProducts = (activeTab === 'popular' ? popularProducts : activeProducts).filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  function handlePay() {
    setPaymentStage('waiting')
    setTimeout(() => setPaymentStage('processing'), 1200)
    setTimeout(() => setPaymentStage('success'), 2400)
  }

  function handleClosePayment() {
    setPaymentStage(null)
    clearCart()
    setOrderNumber((n) => n + 1)
  }

  if (!user) return null

  return (
    <div className="flex h-svh bg-[#f5f5f7]">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-[13px] text-[#6e6e73] no-underline hover:text-[#1d1d1f]"
            >
              <ChevronLeft size={16} />
              대시보드로
            </Link>
            <h1 className="text-[19px] font-semibold text-[#1d1d1f]">{user.storeName} 포스기</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsManaging(true)}
            className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <Settings size={15} />
            메뉴 관리
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-[#e5e5e5] bg-white px-6 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#e0e0e0] px-3 py-2">
            <Search size={15} className="text-[#9a9a9e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="메뉴 검색"
              className="w-40 text-[13px] outline-none"
            />
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'all' ? 'bg-[#1d1d1f] text-white' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'popular' ? 'bg-[#1d1d1f] text-white' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
              }`}
            >
              인기
            </button>
          </div>
        </div>

        {error && <p className="px-6 pt-4 text-[13px] text-[#ff3b30]">{error}</p>}

        <div className="grid grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4">
          {visibleProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addToCart(product)}
              style={{ backgroundColor: colorForProduct(product.id) }}
              className="flex aspect-square flex-col items-start justify-end gap-1 rounded-[14px] p-4 text-left text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span className="text-[15px] font-semibold leading-tight">{product.name}</span>
              <span className="text-[13px] opacity-90">{formatWon(product.price)}</span>
            </button>
          ))}
          {visibleProducts.length === 0 && (
            <p className="col-span-full text-[14px] text-[#9a9a9e]">
              {products.length === 0
                ? '판매 중인 메뉴가 없어요. 메뉴 관리에서 등록해주세요.'
                : '검색 결과가 없어요.'}
            </p>
          )}
        </div>
      </div>

      <div className="flex w-96 shrink-0 flex-col border-l border-[#e5e5e5] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">
            #{String(orderNumber).padStart(3, '0')}
          </h2>
          <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-[12px] font-medium text-[#0066cc]">
            Check
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
          {cart.map((line) => (
            <div key={line.product.id} className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[14px] text-[#1d1d1f]">
                  {line.product.name}
                  {line.quantity > 1 && (
                    <span className="text-[#6e6e73]"> x{line.quantity}</span>
                  )}
                </p>
              </div>
              <span className="text-[13px] text-[#1d1d1f]">
                {formatWon(line.product.price * line.quantity)}
              </span>
              <button
                type="button"
                onClick={() => changeQuantity(line.product.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#1d1d1f]"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                onClick={() => changeQuantity(line.product.id, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#1d1d1f]"
              >
                <Plus size={13} />
              </button>
            </div>
          ))}
          {cart.length === 0 && (
            <p className="text-[13px] text-[#9a9a9e]">메뉴를 선택해 주문을 시작하세요.</p>
          )}
        </div>

        <div className="border-t border-[#e5e5e5] px-6 py-4">
          <div className="mb-1 flex items-center justify-between text-[13px] text-[#6e6e73]">
            <span>Subtotal</span>
            <span>{formatWon(subtotal)}</span>
          </div>
          <div className="mb-3 flex items-center justify-between text-[13px] text-[#6e6e73]">
            <span>Tax (10%)</span>
            <span>{formatWon(tax)}</span>
          </div>
          <div className="mb-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
            <span className="text-[14px] font-medium text-[#1d1d1f]">Total</span>
            <span className="text-[20px] font-semibold text-[#1d1d1f]">{formatWon(total)}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearCart}
              disabled={cart.length === 0}
              className="rounded-full border border-[#e0e0e0] px-4 py-3 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:opacity-40"
            >
              비우기
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={cart.length === 0}
              className="flex-1 rounded-full bg-[#0066cc] py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Pay
            </button>
          </div>
        </div>
      </div>

      {isManaging && (
        <ManageProductsDrawer
          storeId={user.storeId}
          products={products}
          onClose={() => setIsManaging(false)}
          onChange={setProducts}
        />
      )}

      {paymentStage && (
        <PaymentModal total={total} stage={paymentStage} onClose={handleClosePayment} />
      )}
    </div>
  )
}

export default Pos
