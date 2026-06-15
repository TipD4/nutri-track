interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  /** Secondary action shown as a text link (e.g. fallback to manual entry) */
  secondaryLabel?: string
  onSecondary?: () => void
  /** Whether to show a "please wait" hint (for cold starts) */
  hint?: string
}

export function ErrorMessage({ message, onRetry, secondaryLabel, onSecondary, hint }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-red-400 mb-2">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-gray-600 text-sm mb-1">{message}</p>
      {hint && (
        <p className="text-gray-400 text-xs mb-3">{hint}</p>
      )}
      <div className="flex items-center gap-4">
        {onRetry && (
          <button onClick={onRetry} className="text-primary-600 text-sm font-medium hover:text-primary-700">
            重试
          </button>
        )}
        {onSecondary && secondaryLabel && (
          <button onClick={onSecondary} className="text-gray-500 text-sm hover:text-gray-700">
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}
