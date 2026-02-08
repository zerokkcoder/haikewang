'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from "motion/react"
import { X, CheckCircle2, Loader2, ScanLine } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface OrderPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  qrCode: string
  outTradeNo: string
  amount: number
  productName: string
  onSuccess: () => void
}

export default function OrderPaymentModal({
  isOpen,
  onClose,
  qrCode,
  outTradeNo,
  amount,
  productName,
  onSuccess
}: OrderPaymentModalProps) {
  const [isPolling, setIsPolling] = useState(false)
  const [status, setStatus] = useState<'pending' | 'success' | 'closed'>('pending')
  const [isChecking, setIsChecking] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { toast } = useToast()

  const checkStatus = async (manual = false) => {
    if (manual) setIsChecking(true)
    try {
      const res = await fetch('/api/pay/alipay/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outTradeNo })
      })
      const json = await res.json().catch(() => null)
      const tradeStatus = json?.data?.status || json?.status || ''
      
      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        setStatus('success')
        stopPolling()
        toast('支付成功', 'success')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else if (tradeStatus === 'TRADE_CLOSED') {
        setStatus('closed')
        stopPolling()
      } else if (manual) {
        toast('暂未查询到支付结果，请稍候', 'error')
      }
    } catch (e) {
      console.error('Polling error:', e)
      if (manual) toast('查询失败，请重试', 'error')
    } finally {
      if (manual) setIsChecking(false)
    }
  }

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    setIsPolling(false)
  }

  const startPolling = () => {
    if (pollRef.current) return
    setIsPolling(true)
    pollRef.current = setInterval(() => checkStatus(), 3000)
  }

  useEffect(() => {
    if (isOpen) {
      setStatus('pending')
      startPolling()
    } else {
      stopPolling()
    }
    return () => stopPolling()
  }, [isOpen, outTradeNo])

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else if (isOpen && status === 'pending') {
        startPolling()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isOpen, status])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-0 w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="bg-primary/5 p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary font-medium">
                <ScanLine className="w-5 h-5" />
                <span>扫码支付</span>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Info */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  ¥{Number(amount).toFixed(2)}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 px-4">
                  {productName}
                </div>
              </div>

              {/* QR Code Area */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative bg-white p-3 rounded-xl border-2 border-primary/10 shadow-inner">
                   {status === 'success' ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                  ) : (
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                      alt="Payment QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                      unoptimized
                    />
                  )}
                  
                  {/* Status Overlay */}
                  {status === 'closed' && (
                     <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                       <span className="text-red-500 font-medium">订单已关闭</span>
                     </div>
                  )}
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                  {status === 'pending' && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>正在检测支付状态...</span>
                    </>
                  )}
                  {status === 'success' && <span className="text-green-600 font-medium">支付成功！即将跳转...</span>}
                </div>
              </div>

              {/* Footer Info */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>订单号</span>
                  <span className="font-mono">{outTradeNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>支付方式</span>
                  <span>支付宝</span>
                </div>
              </div>
            </div>
            
            {/* Manual Button (Fallback) */}
            <div className="p-4 pt-0">
               <button
                  onClick={() => checkStatus(true)}
                  disabled={isChecking || status === 'success'}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {isChecking ? '查询中...' : '我已完成支付'}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
