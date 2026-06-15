import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  message: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-gray-400 mb-3">{icon}</div>}
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      {action && (
        <button onClick={action.onClick} className="text-primary-600 text-sm font-medium hover:text-primary-700">
          {action.label}
        </button>
      )}
    </div>
  )
}
