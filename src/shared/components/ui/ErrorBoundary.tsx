import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 text-sm mb-4">页面出现错误</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-primary-600 text-sm font-medium"
          >
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
