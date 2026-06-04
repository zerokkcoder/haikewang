import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 每天执行一次，将过期的 VIP 用户自动降级
export async function GET(req: Request) {
  // 可选：添加简单的密钥验证防止他人访问
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret'
  if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    
    // 查找所有 isVip=true 但已过期的用户
    const expiredUsers = await prisma.user.findMany({
      where: {
        isVip: true,
        vipExpireAt: {
          not: null,
          lt: now
        }
      },
      select: {
        id: true,
        username: true,
        vipExpireAt: true
      }
    })

    if (expiredUsers.length === 0) {
      return NextResponse.json({ success: true, message: 'No expired VIPs found', expiredCount: 0 })
    }

    // 批量更新过期用户
    const result = await prisma.user.updateMany({
      where: {
        isVip: true,
        vipExpireAt: {
          not: null,
          lt: now
        }
      },
      data: {
        isVip: false,
        vipPlanId: null
      }
    })

    console.log(`[Cron] Updated ${result.count} expired VIP users`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.count} expired VIP users`,
      expiredCount: result.count,
      users: expiredUsers.map(u => ({ id: u.id, username: u.username, expiredAt: u.vipExpireAt }))
    })
  } catch (err: any) {
    console.error('[Cron] VIP Expiry Error:', err)
    return NextResponse.json({ success: false, message: err?.message || 'Cron job failed' }, { status: 500 })
  }
}
