"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; type: ToastType }

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { id, message, type }])
    // auto dismiss
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    // prevent body scroll jump when toasts render
  }, [items.length])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {items.map(i => (
          <div
            key={i.id}
            className={
              `min-w-[240px] max-w-[360px] px-4 py-2 rounded shadow text-sm ` +
              (i.type === 'success'
                ? 'bg-green-600 text-white'
                : i.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white')
            }
          >
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}