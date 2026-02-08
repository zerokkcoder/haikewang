import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 15 minutes ago
    const timeLimit = new Date(Date.now() - 15 * 60 * 1000)

    const result = await prisma.order.updateMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: timeLimit,
        },
      },
      data: {
        status: 'closed',
      },
    })

    console.log('关闭订单数量:', result.count)
    console.log('关闭订单时间:', timeLimit)
    return NextResponse.json({
      success: true,
      message: `Closed ${result.count} expired orders`,
      count: result.count,
    })
  } catch (error) {
    console.error('Failed to close expired orders:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
