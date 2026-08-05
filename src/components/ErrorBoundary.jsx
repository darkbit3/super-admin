import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#F0EAF8' }}>
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#7C3AED' }}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
