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
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT id, username FROM users WHERE username = ? LIMIT 1', username)
    const u = rows?.[0]
    if (!u) return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })
    await prisma.$executeRawUnsafe('UPDATE users SET avatar_url = ? WHERE id = ?', avatarUrl, u.id)
    return NextResponse.json({ success: true, data: { username: u.username, avatarUrl } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '更新头像失败' }, { status: 500 })
  }
}