import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { Card } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { CalorieRing } from '@/features/dashboard/components/CalorieRing'
import { MacroBarChart } from '@/features/dashboard/components/MacroBarChart'
import { WeightTrendWidget } from '@/features/dashboard/components/WeightTrendWidget'
import { RecentRecords } from '@/features/dashboard/components/RecentRecords'

export default function DashboardPage() {
  const { todayMeals, weightTrend, recentRecords, profile, isLoading, isError } = useDashboardData()

  if (isLoading) return <Spinner fullScreen />
  if (isError) return <ErrorMessage message="加载失败" onRetry={() => window.location.reload()} />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">仪表盘</h2>

      {/* Calorie Ring + Macro Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">今日热量</h3>
          <CalorieRing meals={todayMeals} target={profile?.target_calories} />
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-700 mb-2">营养素</h3>
          <MacroBarChart
            meals={todayMeals}
            targets={profile ? {
              protein_g: profile.target_protein_g,
              fat_g: profile.target_fat_g,
              carbs_g: profile.target_carbs_g,
            } : undefined}
          />
        </Card>
      </div>

      {/* Weight Trend */}
      <Card>
        <WeightTrendWidget data={weightTrend} />
      </Card>

      {/* Recent Records */}
      <Card>
        <RecentRecords records={recentRecords} />
      </Card>
    </div>
  )
}
