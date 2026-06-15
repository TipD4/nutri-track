import { Suspense } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/shared/components/ui/Spinner'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: '仪表盘', icon: '📊' },
  { to: '/records', label: '记录', icon: '🍽️' },
  { to: '/weight', label: '体重', icon: '⚖️' },
  { to: '/analysis', label: '分析', icon: '📋' },
  { to: '/images', label: '图片', icon: '🖼️' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

function PageFallback() {
  return (
    <div className="flex justify-center items-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-56 md:bg-white md:border-r md:border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">NutriTrack</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 truncate mb-2">{user?.email}</div>
          <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-56 pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center h-14">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 py-1 px-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
