import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../ErrorBoundary'
import React from 'react'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render error UI when error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error message')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('should handle try again button click', async () => {
    const user = userEvent.setup()
    
    // Test that clicking "Try again" calls the reset handler
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    const tryAgainButton = screen.getByText('Try again')
    expect(tryAgainButton).toBeInTheDocument()
    
    // Clicking try again should reset the error boundary
    await user.click(tryAgainButton)
    
    // After clicking, the error boundary will reset and try to render children again
    // Since ThrowError still throws, the error UI will be shown again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should handle reload page button click', async () => {
    const user = userEvent.setup()
    const reloadMock = vi.fn()
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Reload page')
    await user.click(reloadButton)

    expect(reloadMock).toHaveBeenCalled()
  })
})
