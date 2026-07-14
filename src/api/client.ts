import axios from 'axios'

export const BASE_URL = 'https://cowtree28-server.duckdns.org'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const TOKEN_STORAGE_KEY = 'accessToken'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type ApiErrorBody = {
  errorCode: string
  message: string
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error) && error.response?.data?.message) {
    return error.response.data.message
  }
  return fallback
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
