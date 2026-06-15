import { Link } from 'react-router-dom'
import { RecordList } from '@/features/records/components/RecordList'
import { Button } from '@/shared/components/ui/Button'

export default function RecordsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">饮食记录</h2>
        <div className="flex gap-2">
          <Link to="/records/new/ai">
            <Button variant="secondary" size="sm">📷 AI 录入</Button>
          </Link>
          <Link to="/records/new">
            <Button size="sm">+ 手动录入</Button>
          </Link>
        </div>
      </div>
      <RecordList />
    </div>
  )
}
