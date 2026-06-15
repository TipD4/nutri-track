import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/shared/components/ui/Spinner'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner fullScreen />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
