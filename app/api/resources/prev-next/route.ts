import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const idStr = url.searchParams.get('id')
    const id = Number(idStr)
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ success: false, message: '无效的资源ID' }, { status: 400 })
    }
    const prev = await prisma.resource.findFirst({
      where: { id: { lt: id } },
      orderBy: { id: 'desc' },
      select: { id: true, title: true },
    })
    const next = await prisma.resource.findFirst({
      where: { id: { gt: id } },
      orderBy: { id: 'asc' },
      select: { id: true, title: true },
    })
    return NextResponse.json({ success: true, data: { prev, next } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '获取上一篇/下一篇失败' }, { status: 500 })
  }
}