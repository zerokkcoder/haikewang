import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16)
  const hashed = crypto.scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hashed.toString('hex')}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, email, password, code } = body || {}
    if (!username || !email || !password || !code) {
      return NextResponse.json({ success: false, message: '请完整填写注册信息' }, { status: 400 })
    }

    // 检查重复
    const dupUser = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })
    if (dupUser) return NextResponse.json({ success: false, message: '用户名或邮箱已注册' }, { status: 400 })

    // 验证邮箱验证码
    const ev = await prisma.emailVerification.findFirst({ where: { email, code, used: false }, orderBy: { id: 'desc' } })
    if (!ev) return NextResponse.json({ success: false, message: '验证码无效' }, { status: 400 })
    if (ev.expiresAt.getTime() < Date.now()) return NextResponse.json({ success: false, message: '验证码已过期' }, { status: 400 })

    const passwordHash = hashPassword(password)
    const user = await prisma.user.create({ data: { username, email, passwordHash, emailVerified: true } })
    await prisma.emailVerification.update({ where: { id: ev.id }, data: { used: true } })

    return NextResponse.json({ success: true, data: { id: user.id, username: user.username, email: user.email } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '注册失败' }, { status: 500 })
  }
}