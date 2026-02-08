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

    return new NextResponse(`已关闭 ${result.count} 个超时订单`)
  } catch (error) {
    console.error('Failed to close expired orders:', error)
    return new NextResponse('服务器内部错误', { status: 500 })
  }
}
