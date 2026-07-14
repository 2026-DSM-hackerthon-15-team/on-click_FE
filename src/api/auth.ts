import { apiClient } from './client'

export type SignupRequest = {
  accountId: string
  password: string
  name: string
  email: string
  storeName: string
  industry?: string
  roadAddress?: string
  closingTime?: string
}

export type SignupResponse = {
  userId: number
  accountId: string
  name: string
  email: string
  storeId: number
  storeName: string
  closingTime: string
  createdAt: string
}

export type LoginRequest = {
  accountId: string
  password: string
}

export type LoginResponse = {
  userId: number
  accessToken: string
  tokenType: string
  expiresIn: number
}

export type MeResponse = {
  userId: number
  accountId: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export type UpdateMeRequest = {
  currentPassword: string
  accountId?: string
  name?: string
  email?: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export function signup(payload: SignupRequest) {
  return apiClient.post<SignupResponse>('/auth/signup', payload).then((res) => res.data)
}

export function login(payload: LoginRequest) {
  return apiClient.post<LoginResponse>('/auth/login', payload).then((res) => res.data)
}

export function getMe() {
  return apiClient.get<MeResponse>('/me').then((res) => res.data)
}

export function updateMe(payload: UpdateMeRequest) {
  return apiClient.patch<MeResponse>('/me', payload).then((res) => res.data)
}

export function changePassword(payload: ChangePasswordRequest) {
  return apiClient.patch<void>('/me/password', payload).then((res) => res.data)
}
