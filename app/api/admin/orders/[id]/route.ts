import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const idNum = Number(id)
  if (!Number.isFinite(idNum) || idNum <= 0) return NextResponse.json({ success: false, message: '无效订单ID' }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.status === 'string') data.status = body.status
  if (typeof body.tradeNo === 'string') data.tradeNo = body.tradeNo
  if (body.paidAt === null) data.paidAt = null
  if (typeof body.productName === 'string') data.productName = body.productName
  try {
    const updated = await prisma.order.update({ where: { id: idNum }, data })
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '更新失败' }, { status: 500 })
  }
}