import { NextResponse } from 'next/server'
import { getAlipay } from '@/lib/alipay'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // Alipay sends form-urlencoded; parse raw text
  const text = await req.text()
  const params = Object.fromEntries(new URLSearchParams(text))
  console.log('alipay notify params:', params)
  console.log('执行回调了')
  const alipay = getAlipay()
  const ok = alipay.checkNotifySign(params)
  if (!ok) return new Response('fail', { status: 400 })

  const outTradeNo = params.out_trade_no || ''
  const tradeNo = params.trade_no || ''
  const tradeStatus = params.trade_status || ''
  const statusMap: Record<string, string> = {
    'TRADE_SUCCESS': 'success',
    'TRADE_FINISHED': 'success',
    'WAIT_BUYER_PAY': 'pending',
    'TRADE_CLOSED': 'closed',
  }
  const newStatus = statusMap[tradeStatus] || 'pending'
  try {
    await prisma.order.update({
      where: { outTradeNo },
      data: {
        tradeNo,
        status: newStatus,
        paidAt: newStatus === 'success' ? new Date() : undefined,
        notifyRaw: params,
      },
    })
  } catch (e) {
    console.warn('update order failed', e)
  }
  return new Response('success')
}