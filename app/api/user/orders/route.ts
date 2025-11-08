import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = String(body?.username || '').trim()
    if (!username) return NextResponse.json({ success: false, message: '缺少用户名' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        outTradeNo: true,
        tradeNo: true,
        orderType: true,
        productId: true,
        productName: true,
        amount: true,
        status: true,
        payChannel: true,
        createdAt: true,
        paidAt: true,
      }
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '获取订单失败', data: [] }, { status: 500 })
  }
}