import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = String(body?.username || '').trim()
    const avatarUrl = String(body?.avatarUrl || '').trim()
    if (!username || !avatarUrl) {
      return NextResponse.json({ success: false, message: '缺少用户名或头像地址' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '更新头像失败' }, { status: 500 })
  }
}