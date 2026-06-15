import { useQueries } from '@tanstack/react-query'
import { getRecords } from '@/services/recordService'
import { getWeightTrend } from '@/services/weightService'
import { getProfile } from '@/services/profileService'
import { todayStr, daysAgoStr } from '@/lib/format'

export function useDashboardData() {
  const today = todayStr()
  const thirtyDaysAgo = daysAgoStr(30)

  const results = useQueries({
    queries: [
      {
        queryKey: ['records', { date: today }],
        queryFn: () => getRecords({ date: today }),
      },
      {
        queryKey: ['weights', 'trend', thirtyDaysAgo, today],
        queryFn: () => getWeightTrend(thirtyDaysAgo, today),
      },
      {
        queryKey: ['records', 'recent'],
        queryFn: () => getRecords({ page: 0 }),
      },
      {
        queryKey: ['profile'],
        queryFn: getProfile,
      },
    ],
  })

  const [todayRecords, weightTrend, recentRecords, profile] = results

  return {
    todayMeals: todayRecords.data?.data || [],
    weightTrend: weightTrend.data || [],
    recentRecords: recentRecords.data?.data?.slice(0, 5) || [],
    profile: profile.data || null,
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
  }
}
