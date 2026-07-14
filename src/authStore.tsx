import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type User = {
  accountId: string
  email: string
  name: string
  storeName: string
  createdAt: string
}

type StoredAccount = User & { password: string }

const STORAGE_KEY_ACCOUNTS = 'accounts'
const STORAGE_KEY_SESSION = 'session'

function loadAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) ?? '[]')
  } catch {
    return []
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts))
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function toUser(account: StoredAccount): User {
  const { password: _password, ...user } = account
  return user
}

type AuthContextValue = {
  user: User | null
  signUp: (
    accountId: string,
    email: string,
    password: string,
    name: string,
    storeName: string,
  ) => { ok: boolean; error?: string }
  login: (accountId: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  updateProfile: (updates: {
    accountId?: string
    name?: string
    email?: string
    storeName?: string
  }) => { ok: boolean; error?: string }
  changePassword: (currentPassword: string, newPassword: string) => { ok: boolean; error?: string }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSession())

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION)
    }
  }, [user])

  function signUp(
    accountId: string,
    email: string,
    password: string,
    name: string,
    storeName: string,
  ) {
    const accounts = loadAccounts()
    if (accounts.some((a) => a.accountId === accountId)) {
      return { ok: false, error: '이미 사용 중인 아이디예요.' }
    }
    if (accounts.some((a) => a.email === email)) {
      return { ok: false, error: '이미 가입된 이메일이에요.' }
    }
    const account: StoredAccount = {
      accountId,
      email,
      password,
      name,
      storeName,
      createdAt: new Date().toISOString(),
    }
    saveAccounts([...accounts, account])
    setUser(toUser(account))
    return { ok: true }
  }

  function login(accountId: string, password: string) {
    const accounts = loadAccounts()
    const account = accounts.find((a) => a.accountId === accountId && a.password === password)
    if (!account) {
      return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않아요.' }
    }
    setUser(toUser(account))
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  function updateProfile(updates: {
    accountId?: string
    name?: string
    email?: string
    storeName?: string
  }) {
    if (!user) return { ok: false, error: '로그인이 필요해요.' }

    const accounts = loadAccounts()
    const nextAccountId = updates.accountId?.trim() || user.accountId
    const nextEmail = updates.email?.trim() || user.email

    if (
      nextAccountId !== user.accountId &&
      accounts.some((a) => a.accountId === nextAccountId)
    ) {
      return { ok: false, error: '이미 사용 중인 아이디예요.' }
    }
    if (nextEmail !== user.email && accounts.some((a) => a.email === nextEmail)) {
      return { ok: false, error: '이미 가입된 이메일이에요.' }
    }

    const updatedAccounts = accounts.map((a) =>
      a.accountId === user.accountId
        ? {
            ...a,
            accountId: nextAccountId,
            email: nextEmail,
            name: updates.name?.trim() || a.name,
            storeName: updates.storeName?.trim() || a.storeName,
          }
        : a,
    )
    saveAccounts(updatedAccounts)

    const updatedAccount = updatedAccounts.find((a) => a.accountId === nextAccountId)
    if (updatedAccount) setUser(toUser(updatedAccount))
    return { ok: true }
  }

  function changePassword(currentPassword: string, newPassword: string) {
    if (!user) return { ok: false, error: '로그인이 필요해요.' }

    const accounts = loadAccounts()
    const account = accounts.find((a) => a.accountId === user.accountId)
    if (!account || account.password !== currentPassword) {
      return { ok: false, error: '현재 비밀번호가 올바르지 않아요.' }
    }

    const updatedAccounts = accounts.map((a) =>
      a.accountId === user.accountId ? { ...a, password: newPassword } : a,
    )
    saveAccounts(updatedAccounts)
    return { ok: true }
  }

  return (
    <AuthContext.Provider
      value={{ user, signUp, login, logout, updateProfile, changePassword }}
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
