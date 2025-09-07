import { toast } from 'sonner'

type NotifyOptions = {
  description?: string
  duration?: number
}

export const notify = {
  success(message: string, opts: NotifyOptions = {}) {
    toast.success(message, opts)
  },
  error(message: string, opts: NotifyOptions = {}) {
    toast.error(message, opts)
  },
  info(message: string, opts: NotifyOptions = {}) {
    toast.message(message, opts)
  },
  warning(message: string, opts: NotifyOptions = {}) {
    toast.warning ? toast.warning(message, opts as any) : toast(message, opts)
  },
}

// Convenience helper to extract a readable message and notify
export function notifyFromError(err: unknown, fallback: string = 'Something went wrong') {
  let msg = fallback
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    msg = (err as any).message || fallback
  }
  notify.error(msg)
}

