import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Spinner } from '@/shared/components/ui/Spinner'

export function LoginPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner fullScreen />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">NutriTrack</h1>
          <p className="text-gray-500 text-sm">用最简单的用户名和密码</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
