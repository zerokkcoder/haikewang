import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const resourceId = Number(body?.resourceId || 0)
    const username = String(body?.username || '').trim()
    if (!resourceId || !username) {
      return NextResponse.json({ success: false, message: '缺少参数' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ success: true, data: { hasAccess: false, isVip: false } })
    }
    const now = new Date()
    const effectiveVip = !!user.isVip && (!!user.vipExpireAt ? (new Date(user.vipExpireAt) > now) : true)
    if (effectiveVip) {
      return NextResponse.json({ success: true, data: { hasAccess: true, isVip: true } })
    }
    const access = await prisma.userResourceAccess.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId } }
    })
    return NextResponse.json({ success: true, data: { hasAccess: !!access, isVip: effectiveVip } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '查询失败' }, { status: 500 })
  }
}