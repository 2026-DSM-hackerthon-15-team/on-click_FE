import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { changePassword as apiChangePassword, getMe, login as apiLogin, signup as apiSignup, updateMe } from './api/auth'
import { listStores } from './api/stores'
import { clearAccessToken, getAccessToken, getApiErrorMessage, setAccessToken } from './api/client'

export type User = {
  userId: number
  accountId: string
  name: string
  email: string
  storeId: number
  storeName: string
  closingTime: string
  createdAt: string
}

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  signUp: (
    accountId: string,
    email: string,
    password: string,
    name: string,
    storeName: string,
  ) => Promise<{ ok: boolean; error?: string }>
  login: (accountId: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: {
    accountId?: string
    name?: string
    email?: string
    currentPassword: string
  }) => Promise<{ ok: boolean; error?: string }>
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadUserProfile(): Promise<User> {
  const [me, stores] = await Promise.all([getMe(), listStores()])
  const primaryStore = stores[0]
  return {
    userId: me.userId,
    accountId: me.accountId,
    name: me.name,
    email: me.email,
    storeId: primaryStore?.id ?? 0,
    storeName: primaryStore?.name ?? '',
    closingTime: primaryStore?.closingTime ?? '22:00',
    createdAt: me.createdAt,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    loadUserProfile()
      .then(setUser)
      .catch(() => clearAccessToken())
      .finally(() => setIsLoading(false))
  }, [])

  async function signUp(
    accountId: string,
    email: string,
    password: string,
    name: string,
    storeName: string,
  ) {
    try {
      await apiSignup({ accountId, password, name, email, storeName })
      const loginResult = await apiLogin({ accountId, password })
      setAccessToken(loginResult.accessToken)
      const profile = await loadUserProfile()
      setUser(profile)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, '회원가입에 실패했어요.') }
    }
  }

  async function login(accountId: string, password: string) {
    try {
      const loginResult = await apiLogin({ accountId, password })
      setAccessToken(loginResult.accessToken)
      const profile = await loadUserProfile()
      setUser(profile)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, '로그인에 실패했어요.') }
    }
  }

  function logout() {
    clearAccessToken()
    setUser(null)
  }

  async function updateProfile(updates: {
    accountId?: string
    name?: string
    email?: string
    currentPassword: string
  }) {
    try {
      const updated = await updateMe(updates)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              accountId: updated.accountId,
              name: updated.name,
              email: updated.email,
            }
          : prev,
      )
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, '저장에 실패했어요.') }
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      await apiChangePassword({ currentPassword, newPassword })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, '변경에 실패했어요.') }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signUp, login, logout, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
