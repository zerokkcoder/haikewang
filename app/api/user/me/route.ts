import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = String(body?.username || '').trim()
    if (!username) return NextResponse.json({ success: false, message: '缺少用户名' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { username }, include: { vipPlan: true } })
    if (!user) return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })
    const data = {
      id: user.id,
      username: user.username,
      isVip: user.isVip,
      vipExpireAt: user.vipExpireAt,
      vipPlanId: user.vipPlanId,
      vipPlanName: user.vipPlan?.name || null,
    }
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '查询失败' }, { status: 500 })
  }
}