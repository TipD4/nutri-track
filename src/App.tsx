import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth'
import { LoginPage } from '@/features/auth'
import { ProtectedRoute } from '@/shared/components/layout/ProtectedRoute'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary'
import { Spinner } from '@/shared/components/ui/Spinner'

// Lazy load all feature pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const RecordsPage = lazy(() => import('@/features/records/pages/RecordsPage'))
const RecordNewPage = lazy(() => import('@/features/records/pages/RecordNewPage'))
const AIRecordPage = lazy(() => import('@/features/ai-recognition/pages/AIRecordPage'))
const RecordEditPage = lazy(() => import('@/features/records/pages/RecordEditPage'))
const WeightPage = lazy(() => import('@/features/weight/pages/WeightPage'))
const AnalysisPage = lazy(() => import('@/features/analysis/pages/AnalysisPage'))
const ImagesPage = lazy(() => import('@/features/images/pages/ImagesPage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="flex justify-center items-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><DashboardPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/records" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><RecordsPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/records/new" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><RecordNewPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/records/new/ai" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><AIRecordPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/records/:id" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><RecordEditPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/weight" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><WeightPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/analysis" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><AnalysisPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/images" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><ImagesPage /></Suspense></ErrorBoundary>
                } />
                <Route path="/settings" element={
                  <ErrorBoundary><Suspense fallback={<PageFallback />}><SettingsPage /></Suspense></ErrorBoundary>
                } />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
