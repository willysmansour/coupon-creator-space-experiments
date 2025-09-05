import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '../useAuth'
import { supabase } from '@/integrations/supabase/client'
import React from 'react'

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it('should handle successful session fetch', async () => {
    const mockSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      },
      access_token: 'test-token'
    }

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.session).toEqual(mockSession)
    expect(result.current.user).toEqual(mockSession.user)
  })

  it('should handle no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.session).toBe(null)
    expect(result.current.user).toBe(null)
  })

  it('should handle auth state changes', async () => {
    let authCallback: any = null
    
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback
      return {
        data: {
          subscription: { unsubscribe: vi.fn() }
        }
      } as any
    })

    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    })

    // Wait for initial state
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newSession = {
      user: {
        id: 'new-user-id',
        email: 'new@example.com'
      },
      access_token: 'new-token'
    }

    // Simulate auth state change
    if (authCallback) {
      authCallback('SIGNED_IN', newSession)
    }

    // Force a rerender to pick up the state change
    rerender()

    await waitFor(() => {
      expect(result.current.session).toEqual(newSession)
      expect(result.current.user).toEqual(newSession.user)
    }, { timeout: 2000 })
  })
})
