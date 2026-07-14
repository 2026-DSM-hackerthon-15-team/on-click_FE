import { apiClient } from './client'

export type Product = {
  id: number
  storeId: number
  name: string
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateProductRequest = {
  name: string
  price: number
}

export type UpdateProductRequest = {
  name?: string
  price?: number
}

export function listProducts(storeId: number) {
  return apiClient.get<Product[]>(`/stores/${storeId}/products`).then((res) => res.data)
}

export function createProduct(storeId: number, payload: CreateProductRequest) {
  return apiClient.post<Product>(`/stores/${storeId}/products`, payload).then((res) => res.data)
}

export function updateProduct(storeId: number, productId: number, payload: UpdateProductRequest) {
  return apiClient
    .patch<Product>(`/stores/${storeId}/products/${productId}`, payload)
    .then((res) => res.data)
}

export function updateProductStatus(storeId: number, productId: number, active: boolean) {
  return apiClient
    .patch<Product>(`/stores/${storeId}/products/${productId}/status`, { active })
    .then((res) => res.data)
}
