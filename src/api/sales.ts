import { apiClient } from './client'

export type SaleStatus = 'COMPLETED' | 'CANCELLED'

export type SaleItem = {
  id: number
  lineNo: number
  productId: number
  productName: string
  productPrice: number
  quantity: number
  paidAmount: number
}

export type Sale = {
  saleId: number
  storeId: number
  clientTransactionId: string | null
  soldAt: string
  totalQuantity: number
  totalPaidAmount: number
  status: SaleStatus
  createdAt: string
  cancelledAt: string | null
  items: SaleItem[]
}

export type CreateSaleItem = {
  lineNo: number
  productId: number
  quantity: number
  paidAmount: number
}

export type CreateSaleRequest = {
  clientTransactionId?: string
  soldAt: string
  items: CreateSaleItem[]
}

export type SalesPage = {
  content: Sale[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export function createSale(storeId: number, payload: CreateSaleRequest) {
  return apiClient
    .post<Sale>(`/stores/${storeId}/sales/transactions`, payload)
    .then((res) => res.data)
}

export function listSales(
  storeId: number,
  params?: { page?: number; size?: number; sortBy?: string; sortDirection?: 'ASC' | 'DESC' },
) {
  return apiClient
    .get<SalesPage>(`/stores/${storeId}/sales/transactions`, { params })
    .then((res) => res.data)
}

export function cancelSale(storeId: number, saleId: number) {
  return apiClient
    .post<Sale>(`/stores/${storeId}/sales/transactions/${saleId}/cancel`)
    .then((res) => res.data)
}
