import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorHandler, ErrorType } from '../error-handler'
import { toast } from 'sonner'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
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
    expect(toast.error).toHaveBeenCalledWith(
      'Autentiseringsfel',
      expect.objectContaining({
        description: 'Invalid credentials'
      })
    )
  })

  it('should handle network errors', () => {
    const networkError = new Error('Failed to fetch')

    const result = ErrorHandler.handle(networkError)

    expect(result.type).toBe(ErrorType.NETWORK)
    expect(result.message).toBe('Nätverksfel - försök igen')
    expect(toast.error).toHaveBeenCalledWith(
      'Nätverksfel',
      expect.objectContaining({
        description: expect.stringContaining('anslutning')
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
    expect(toast.warning).toHaveBeenCalledWith(
      'Valideringsfel',
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
    expect(toast.error).toHaveBeenCalledWith(
      'Behörighetsfel',
      expect.objectContaining({
        description: expect.stringContaining('behörighet')
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
    expect(toast.error).toHaveBeenCalledWith(
      'Databasfel',
      expect.objectContaining({
        description: expect.stringContaining('redan')
      })
    )
  })

  it('should handle unknown errors', () => {
    const unknownError = { something: 'weird' }

    const result = ErrorHandler.handle(unknownError)

    expect(result.type).toBe(ErrorType.UNKNOWN)
    expect(toast.error).toHaveBeenCalledWith(
      'Oväntat fel',
      expect.objectContaining({
        description: expect.stringContaining('oväntat')
      })
    )
  })

  it('should store error history', () => {
    ErrorHandler.handle(new Error('Error 1'))
    ErrorHandler.handle(new Error('Error 2'))
    ErrorHandler.handle(new Error('Error 3'))

    const errors = ErrorHandler.getErrors()
    
    expect(errors).toHaveLength(3)
    expect(errors[0].message).toBe('Ett oväntat fel uppstod')
    expect(errors[1].message).toBe('Ett oväntat fel uppstod')
    expect(errors[2].message).toBe('Ett oväntat fel uppstod')
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
