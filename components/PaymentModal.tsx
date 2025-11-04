'use client'

import { useState } from 'react'
import { processPayment, generateOrderId, paymentMethods, createPaymentStatus } from '@/lib/payment'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  onPaymentSuccess: (transactionId: string) => void
}

export default function PaymentModal({ isOpen, onClose, amount, description, onPaymentSuccess }: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'alipay' | 'wechat'>('alipay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'qr' | 'success'>('select')
  const [paymentData, setPaymentData] = useState<{ qrCode?: string; paymentUrl?: string; transactionId?: string }>({})

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStep('processing')

    try {
      const orderId = generateOrderId()
      const response = await processPayment({
        amount,
        orderId,
        description,
        paymentMethod: selectedPaymentMethod
      })

      if (response.success) {
        createPaymentStatus(orderId, response.transactionId!, amount, selectedPaymentMethod)
        
        if (response.qrCode) {
          setPaymentData({ qrCode: response.qrCode, transactionId: response.transactionId })
          setPaymentStep('qr')
        } else if (response.paymentUrl) {
          setPaymentData({ paymentUrl: response.paymentUrl, transactionId: response.transactionId })
          setPaymentStep('qr')
        }
      } else {
        alert('支付初始化失败: ' + response.error)
        setPaymentStep('select')
      }
    } catch (error) {
      alert('支付处理出错: ' + error)
      setPaymentStep('select')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentStep('success')
    setTimeout(() => {
      onPaymentSuccess(paymentData.transactionId!)
      onClose()
      setPaymentStep('select')
      setPaymentData({})
    }, 2000)
  }

  const handleCancel = () => {
    if (paymentStep === 'select') {
      onClose()
    } else {
      setPaymentStep('select')
      setPaymentData({})
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 text-foreground">
        {paymentStep === 'select' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">选择支付方式</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="text-sm text-muted-foreground">支付金额</div>
                <div className="text-2xl font-semibold text-foreground">¥{amount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{description}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {Object.entries(paymentMethods).map(([key, method]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPaymentMethod(key as 'alipay' | 'wechat')}
                  className={`w-full p-4 border border-border rounded-lg flex items-center gap-3 transition-colors ${
                    selectedPaymentMethod === key
                      ? 'border-primary bg-secondary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="text-2xl">{method.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === key ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {selectedPaymentMethod === key && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {isProcessing ? '处理中...' : '确认支付'}
              </button>
            </div>
          </>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在处理支付...</p>
          </div>
        )}

        {paymentStep === 'qr' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">扫码支付</h2>
              <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-muted p-6 rounded-lg mb-4">
                {paymentData.qrCode && (
                  <div className="text-center">
                    <div className="w-48 h-48 bg-card border border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-muted-foreground">
                        <div className="text-4xl mb-2">📱</div>
                        <div className="text-sm">{paymentMethods[selectedPaymentMethod].name}二维码</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">请使用{paymentMethods[selectedPaymentMethod].name}扫描二维码</p>
                  </div>
                )}
                {paymentData.paymentUrl && (
                  <div className="text-center">
                    <div className="text-lg mb-4">正在跳转到{paymentMethods[selectedPaymentMethod].name}...</div>
                    <a
                      href={paymentData.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block btn btn-primary px-6 py-3"
                    >
                      打开{paymentMethods[selectedPaymentMethod].name}
                    </a>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                支付金额: <span className="font-semibold text-foreground">¥{amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 btn btn-secondary"
              >
                取消支付
              </button>
              <button
                onClick={handlePaymentSuccess}
                className="flex-1 btn btn-primary"
              >
                支付完成
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}