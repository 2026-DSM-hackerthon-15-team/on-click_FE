import { Navigate } from 'react-router-dom'
import { useAuth } from '../authStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default RequireAuth
