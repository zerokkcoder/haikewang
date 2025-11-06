import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

function verifyAdmin(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
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

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16)
  const hashed = crypto.scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hashed.toString('hex')}`
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const idNum = Number(id)
  if (!Number.isFinite(idNum) || idNum <= 0) return NextResponse.json({ success: false, message: '无效用户ID' }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.username === 'string') data.username = body.username.trim()
  if (typeof body.email === 'string') data.email = body.email.trim()
  if (typeof body.emailVerified === 'boolean') data.emailVerified = body.emailVerified
  if (typeof body.password === 'string' && body.password.length >= 6) data.passwordHash = hashPassword(body.password)
  try {
    const updated = await prisma.user.update({ where: { id: idNum }, data })
    return NextResponse.json({ success: true, data: { id: updated.id, username: updated.username, email: updated.email, emailVerified: updated.emailVerified, createdAt: updated.createdAt } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '更新失败' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const idNum = Number(id)
  if (!Number.isFinite(idNum) || idNum <= 0) return NextResponse.json({ success: false, message: '无效用户ID' }, { status: 400 })
  try {
    await prisma.user.delete({ where: { id: idNum } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '删除失败' }, { status: 500 })
  }
}