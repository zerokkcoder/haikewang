import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = String(body?.username || '').trim()
    if (!username) return NextResponse.json({ success: false, message: '缺少用户名' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { username }, include: { vipPlan: true } })
    if (!user) return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })
    let avatarUrl: string | null = null
    try {
      const rows: any[] = await prisma.$queryRawUnsafe('SELECT avatar_url FROM users WHERE id = ? LIMIT 1', user.id)
      avatarUrl = rows?.[0]?.avatar_url ?? null
    } catch {}
    // Check if VIP is expired
    const now = new Date()
    const isExpired = user.vipExpireAt && new Date(user.vipExpireAt) < now
    const isVip = !!user.isVip && !isExpired
    const data = {
      id: user.id,
      username: user.username,
      isVip,
      vipExpireAt: isExpired ? null : user.vipExpireAt,
      vipPlanId: isExpired ? null : user.vipPlanId,
      vipPlanName: isExpired ? null : (user.vipPlan?.name || null),
      vipDailyLimit: isExpired ? null : (user.vipPlan?.dailyDownloads ?? null),
      avatarUrl,
    }
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '查询失败' }, { status: 500 })
  }
}