'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from "motion/react"
import { X, CreditCard, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function UnpaidOrderReminder() {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Only check and show on homepage
    if (pathname !== '/') {
      setIsOpen(false)
      return
    }

    const checkOrders = async () => {
      try {
        const raw = window.localStorage.getItem('site_user')
        if (!raw) return
        const user = JSON.parse(raw)
        if (!user?.username) return

        const res = await fetch('/api/user/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username }),
        })
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          const pending = json.data.filter((o: any) => o.status === 'pending')
          if (pending.length > 0) {
            setPendingCount(pending.length)
            setIsOpen(true)
          }
        }
      } catch (e) {
        console.error('Failed to check orders', e)
      }
    }

    // Check on mount (if on home) and every 5 minutes
    checkOrders()
    const interval = setInterval(() => {
       // Re-check pathname inside interval to be safe, although effect re-runs on pathname change
       if (window.location.pathname === '/') {
          checkOrders()
       }
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [pathname])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-card text-card-foreground shadow-xl rounded-xl p-5 border border-border w-80 ring-1 ring-black/5"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary/50"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">待支付订单</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              您有 <span className="text-red-500 font-bold mx-0.5">{pendingCount}</span> 笔订单等待支付，请及时处理以免订单失效。
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                稍后提醒
              </button>
              <Link
                href="/profile?tab=orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm font-medium"
              >
                <CreditCard className="w-3.5 h-3.5" />
                去支付
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
