import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorHandler, ErrorType } from '../error-handler'
import { notify } from '@/lib/notify'

// Mock notify wrapper
vi.mock('@/lib/notify', () => ({
  notify: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear error history
    ErrorHandler['errors'] = []
  })

  it('should handle authentication errors', () => {
    const authError = {
      message: 'Invalid credentials',
      code: 'invalid_credentials'
    }

    const result = ErrorHandler.handle(authError)

    expect(result.type).toBe(ErrorType.AUTHENTICATION)
    expect(result.message).toBe('Invalid credentials')
    expect((notify as any).error).toHaveBeenCalledWith(
      'Authentication error',
      expect.objectContaining({
        description: 'Invalid credentials'
      })
    )
  })

  it('should handle network errors', () => {
    const networkError = new Error('Failed to fetch')

    const result = ErrorHandler.handle(networkError)

    expect(result.type).toBe(ErrorType.NETWORK)
    expect(result.message).toBe('Network error - please try again')
    expect((notify as any).error).toHaveBeenCalledWith(
      'Network error',
      expect.objectContaining({
        description: expect.stringContaining('Check your connection')
      })
    )
  })

  it('should handle validation errors', () => {
    const validationError = {
      message: 'Email is required',
      code: 'validation_error'
    }

    const result = ErrorHandler.handle(validationError, { field: 'email' })

    expect(result.type).toBe(ErrorType.VALIDATION)
    expect(result.message).toBe('Email is required')
    expect((notify as any).warning).toHaveBeenCalledWith(
      'Validation error',
      expect.objectContaining({
        description: 'Email is required'
      })
    )
  })

  it('should handle permission errors', () => {
    const permissionError = {
      message: 'Permission denied',
      code: '42501' // PostgreSQL permission denied code
    }

    const result = ErrorHandler.handle(permissionError)

    expect(result.type).toBe(ErrorType.PERMISSION)
    expect((notify as any).error).toHaveBeenCalledWith(
      'Permission error',
      expect.objectContaining({
        description: expect.stringContaining('permission')
      })
    )
  })

  it('should handle database errors', () => {
    const dbError = {
      message: 'duplicate key value',
      code: '23505' // PostgreSQL unique violation
    }

    const result = ErrorHandler.handle(dbError)

    expect(result.type).toBe(ErrorType.DATABASE)
    expect((notify as any).error).toHaveBeenCalledWith(
      'Database error',
      expect.objectContaining({
        description: expect.stringContaining('already exists')
      })
    )
  })

  it('should handle unknown errors', () => {
    const unknownError = { something: 'weird' }

    const result = ErrorHandler.handle(unknownError)

    expect(result.type).toBe(ErrorType.UNKNOWN)
    expect((notify as any).error).toHaveBeenCalledWith(
      'Unexpected error',
      expect.objectContaining({
        description: expect.stringContaining('unexpected')
      })
    )
  })

  it('should store error history', () => {
    ErrorHandler.handle(new Error('Error 1'))
    ErrorHandler.handle(new Error('Error 2'))
    ErrorHandler.handle(new Error('Error 3'))

    const errors = ErrorHandler.getErrors()
    
    expect(errors).toHaveLength(3)
    expect(errors[0].message).toBe('An unexpected error occurred')
    expect(errors[1].message).toBe('An unexpected error occurred')
    expect(errors[2].message).toBe('An unexpected error occurred')
  })

  it('should clear error history', () => {
    ErrorHandler.handle(new Error('Test error'))
    
    expect(ErrorHandler.getErrors()).toHaveLength(1)
    
    ErrorHandler.clearErrors()
    
    expect(ErrorHandler.getErrors()).toHaveLength(0)
  })

  it('should include context in error structure', () => {
    const context = {
      userId: 'test-user',
      action: 'uploadFile',
      metadata: { fileName: 'test.pdf' }
    }

    const result = ErrorHandler.handle(new Error('Upload failed'), context)

    expect(result.context).toEqual(context)
  })

  it('should include timestamp in error structure', () => {
    const before = Date.now()
    const result = ErrorHandler.handle(new Error('Test'))
    const after = Date.now()

    expect(result.timestamp).toBeGreaterThanOrEqual(before)
    expect(result.timestamp).toBeLessThanOrEqual(after)
  })
})
