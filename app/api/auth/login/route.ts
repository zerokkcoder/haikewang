import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const calculated = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(calculated, Buffer.from(hashHex, 'hex'))
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { identifier, password } = body || {}
    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: '请输入用户名/邮箱和密码' }, { status: 400 })
    }
    const user = await prisma.user.findFirst({ where: { OR: [{ username: identifier }, { email: identifier }] } })
    if (!user) return NextResponse.json({ success: false, message: '用户不存在或密码错误' }, { status: 400 })
    const ok = verifyPassword(password, user.passwordHash)
    if (!ok) return NextResponse.json({ success: false, message: '用户不存在或密码错误' }, { status: 400 })

    // 签发站点用户会话令牌到 Cookie，便于服务端识别当前用户
    const secret = process.env.SITE_JWT_SECRET || 'site_dev_secret_change_me'
    const token = jwt.sign({ uid: user.id, username: user.username }, secret, { expiresIn: '30d' })
    const res = NextResponse.json({ success: true, data: { id: user.id, username: user.username, email: user.email } })
    res.cookies.set('site_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '登录失败' }, { status: 500 })
  }
}