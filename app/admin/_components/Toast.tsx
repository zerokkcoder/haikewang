'use client'

import { useEffect } from 'react'

interface ToastProps {
  open: boolean
  type?: 'success' | 'error' | 'info'
  title?: string
  message?: string
  duration?: number
  onClose?: () => void
}

export default function Toast({ open, type = 'info', title, message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => { onClose?.() }, duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  if (!open) return null
  const base = 'fixed bottom-4 right-4 z-50 min-w-[260px] max-w-[340px] rounded-lg shadow-lg ring-1 p-3'
  const tone = type === 'success'
    ? 'bg-green-50 ring-green-200 text-green-800'
    : type === 'error'
    ? 'bg-red-50 ring-red-200 text-red-800'
    : 'bg-background ring-border text-foreground'

  return (
    <div className={`${base} ${tone}`} role="status" aria-live="polite">
      {title && <div className="text-sm font-medium mb-1">{title}</div>}
      {message && <div className="text-xs opacity-90">{message}</div>}
      <button onClick={onClose} className="btn btn-secondary btn-sm mt-2">关闭</button>
    </div>
  )
}