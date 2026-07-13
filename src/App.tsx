import { Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import InstagramGenerator from './pages/InstagramGenerator'
import Consulting from './pages/Consulting'
import { ChatProvider } from './chatStore'

function App() {
  return (
    <ChatProvider>
      <div className="flex min-h-svh">
        <Sidebar />
        <main className="flex-1 bg-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/instagram" element={<InstagramGenerator />} />
            <Route path="/consulting" element={<Consulting />} />
          </Routes>
        </main>
      </div>
    </ChatProvider>
  )
}

export default App
