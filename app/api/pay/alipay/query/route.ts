import { NextResponse } from 'next/server'
import { getAlipay } from '@/lib/alipay'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const out_trade_no = String(body?.outTradeNo || '')
    if (!out_trade_no) return NextResponse.json({ success: false, message: '缺少订单号' }, { status: 400 })
    const alipay = await getAlipay()
    let res: any
    try {
      res = await alipay.exec('alipay.trade.query', { biz_content: { out_trade_no } })
    } catch {
      res = await alipay.exec('alipay.trade.query', { biz_content: { out_trade_no } }, { validateSign: false })
    }
    const status = res?.tradeStatus || 'UNKNOWN'

    // Proactively update database if paid, because notify might be delayed or fail (especially in dev)
    if (status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED') {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { outTradeNo: out_trade_no } })
        if (order && order.status !== 'success') {
          const tradeNo = res?.tradeNo || ''
          // Update order
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'success',
              paidAt: new Date(),
              tradeNo: tradeNo,
              notifyRaw: res as any,
            }
          })
          
          // Grant entitlements
          if (order.orderType === 'member' && order.userId) {
             const plan = await tx.membershipPlan.findUnique({ where: { id: order.productId } })
             if (plan) {
               let expire: Date | null = null
               if (plan.durationDays > 0) {
                 expire = new Date()
                 expire.setDate(expire.getDate() + plan.durationDays)
               }
               await tx.user.update({
                 where: { id: order.userId },
                 data: {
                   isVip: true,
                   vipPlanId: plan.id,
                   vipExpireAt: expire || null,
                 }
               })
             }
          } else if (order.orderType === 'course' && order.userId) {
            await tx.userResourceAccess.upsert({
              where: { userId_resourceId: { userId: order.userId, resourceId: order.productId } },
              update: {},
              create: { userId: order.userId, resourceId: order.productId }
            })
          }
        }
      })
    } else if (status === 'TRADE_CLOSED') {
      const order = await prisma.order.findUnique({ where: { outTradeNo: out_trade_no } })
      if (order && order.status !== 'closed' && order.status !== 'success') {
         await prisma.order.update({
           where: { id: order.id },
           data: { status: 'closed' }
         })
      }
    }

    return NextResponse.json({ success: true, data: { status, raw: res } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '查询失败' }, { status: 500 })
  }
}