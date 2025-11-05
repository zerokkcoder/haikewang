import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [{ id: 'asc' }],
      select: { id: true, name: true },
    })
    return NextResponse.json({ success: true, data: tags })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '获取标签失败', data: [] }, { status: 500 })
  }
}