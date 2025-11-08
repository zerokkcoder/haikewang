import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function verifyAdmin(req: Request) {
  const cookieHeader = (req as any).headers.get('cookie') || ''
  const match = cookieHeader.match(/admin_token=([^;]+)/)
  const token = match ? match[1] : ''
  if (!token) return null
  try {
    const secret = process.env.ADMIN_JWT_SECRET || 'dev_secret_change_me'
    return jwt.verify(token, secret) as any
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  try {
    const user = await prisma.adminUser.findUnique({ where: { id: Number(admin.uid) }, select: { id: true, username: true, role: true, status: true, lastLoginAt: true } })
    if (!user) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '获取失败' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const newUsername = (body?.newUsername ?? '').trim()
  const oldPassword = String(body?.oldPassword ?? '')
  const newPassword = String(body?.newPassword ?? '')

  try {
    const user = await prisma.adminUser.findUnique({ where: { id: Number(admin.uid) } })
    if (!user) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 })

    // Prepare updates
    const data: any = {}
    if (newUsername && newUsername !== user.username) {
      // Check uniqueness
      const exists = await prisma.adminUser.findUnique({ where: { username: newUsername }, select: { id: true } })
      if (exists) return NextResponse.json({ success: false, message: '用户名已存在' }, { status: 400 })
      data.username = newUsername
    }
    if (newPassword) {
      // Verify old password first
      const ok = await bcrypt.compare(oldPassword, user.passwordHash)
      if (!ok) return NextResponse.json({ success: false, message: '当前密码错误' }, { status: 400 })
      data.passwordHash = await bcrypt.hash(newPassword, 10)
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, message: '未提供可更新的字段' }, { status: 400 })
    }
    const updated = await prisma.adminUser.update({ where: { id: user.id }, data })

    // If username changed, issue new token
    let res = NextResponse.json({ success: true, data: { id: updated.id, username: updated.username } })
    if (data.username) {
      try {
        const secret = process.env.ADMIN_JWT_SECRET || 'dev_secret_change_me'
        const token = jwt.sign({ uid: updated.id, username: updated.username, role: updated.role }, secret, { expiresIn: '2h' })
        res.cookies.set('admin_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 2 * 60 * 60,
        })
      } catch {}
    }
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '保存失败' }, { status: 500 })
  }
}