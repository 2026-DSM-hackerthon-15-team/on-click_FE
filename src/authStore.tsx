import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type User = {
  email: string
  name: string
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

type AuthContextValue = {
  user: User | null
  signUp: (email: string, password: string, name: string) => { ok: boolean; error?: string }
  login: (email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
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

  function signUp(email: string, password: string, name: string) {
    const accounts = loadAccounts()
    if (accounts.some((a) => a.email === email)) {
      return { ok: false, error: '이미 가입된 이메일이에요.' }
    }
    const account: StoredAccount = { email, password, name }
    saveAccounts([...accounts, account])
    setUser({ email, name })
    return { ok: true }
  }

  function login(email: string, password: string) {
    const accounts = loadAccounts()
    const account = accounts.find((a) => a.email === email && a.password === password)
    if (!account) {
      return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않아요.' }
    }
    setUser({ email: account.email, name: account.name })
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
