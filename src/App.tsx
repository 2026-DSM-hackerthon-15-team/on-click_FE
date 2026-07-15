import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RequireAuth from './components/RequireAuth'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import InstagramGenerator from './pages/InstagramGenerator'
import { ConsultingList, ConsultingDetail } from './pages/Consulting'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyPage from './pages/MyPage'
import Pos from './pages/Pos'
import { ChatProvider } from './chatStore'
import { AuthProvider, useAuth } from './authStore'

function AppShell() {
  const { user, isLoading } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={!isLoading && user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={!isLoading && user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />
      <Route
        path="/pos"
        element={
          <RequireAuth>
            <Pos />
          </RequireAuth>
        }
      />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="flex min-h-svh overflow-x-hidden">
              <Sidebar />
              <main className="min-w-0 flex-1 bg-white">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat/:id" element={<Chat />} />
                  <Route path="/instagram" element={<InstagramGenerator />} />
                  <Route path="/consulting" element={<ConsultingList />} />
                  <Route path="/consulting/:consultingId" element={<ConsultingDetail />} />
                  <Route path="/mypage" element={<MyPage />} />
                </Routes>
              </main>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppShell />
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
