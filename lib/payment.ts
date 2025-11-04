// Payment integration utilities for Alipay and WeChat Pay

export interface PaymentRequest {
  amount: number
  orderId: string
  description: string
  paymentMethod: 'alipay' | 'wechat'
  returnUrl?: string
  notifyUrl?: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  qrCode?: string
  transactionId?: string
  error?: string
}

// Mock payment processing - in a real implementation, this would integrate with actual payment APIs
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock success/failure (90% success rate for demo)
  const isSuccess = Math.random() > 0.1
  
  if (!isSuccess) {
    return {
      success: false,
      error: '支付失败，请重试'
    }
  }
  
  // Generate mock payment URL or QR code based on payment method
  if (request.paymentMethod === 'alipay') {
    return {
      success: true,
      paymentUrl: `https://mock-alipay.com/pay?orderId=${request.orderId}&amount=${request.amount}`,
      transactionId: `ALI${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    }
  } else {
    return {
      success: true,
      qrCode: `https://mock-wechat-qr.com/pay?orderId=${request.orderId}&amount=${request.amount}`,
      transactionId: `WX${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    }
  }
}

// Verify payment status
export async function verifyPayment(transactionId: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock verification (95% success rate for demo)
  return Math.random() > 0.05
}

// Generate unique order ID
export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `ORDER_${timestamp}_${random}`
}

// Format payment amount (convert to cents for payment APIs)
export function formatPaymentAmount(amount: number): number {
  return Math.round(amount * 100)
}

// Payment method configurations
export const paymentMethods = {
  alipay: {
    name: '支付宝',
    icon: '💰',
    color: '#1677FF',
    description: '使用支付宝扫码支付'
  },
  wechat: {
    name: '微信支付',
    icon: '💚',
    color: '#07C160',
    description: '使用微信扫码支付'
  }
}

// Payment status tracking
export interface PaymentStatus {
  orderId: string
  transactionId: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  amount: number
  paymentMethod: 'alipay' | 'wechat'
  createdAt: Date
  completedAt?: Date
}

// Mock payment status storage (in a real app, this would be a database)
const paymentStatusMap = new Map<string, PaymentStatus>()

export function getPaymentStatus(orderId: string): PaymentStatus | null {
  return paymentStatusMap.get(orderId) || null
}

export function updatePaymentStatus(orderId: string, status: PaymentStatus['status']): void {
  const payment = paymentStatusMap.get(orderId)
  if (payment) {
    payment.status = status
    if (status === 'success' || status === 'failed' || status === 'cancelled') {
      payment.completedAt = new Date()
    }
    paymentStatusMap.set(orderId, payment)
  }
}

export function createPaymentStatus(
  orderId: string,
  transactionId: string,
  amount: number,
  paymentMethod: 'alipay' | 'wechat'
): PaymentStatus {
  const status: PaymentStatus = {
    orderId,
    transactionId,
    status: 'pending',
    amount,
    paymentMethod,
    createdAt: new Date()
  }
  paymentStatusMap.set(orderId, status)
  return status
}