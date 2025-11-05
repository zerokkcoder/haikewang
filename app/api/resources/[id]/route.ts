import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const idNum = Number(id)
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return NextResponse.json({ success: false, message: '无效的资源ID' }, { status: 400 })
    }
    const r = await prisma.resource.findUnique({
      where: { id: idNum },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        downloads: true,
      },
    })
    if (!r) return NextResponse.json({ success: false, message: '资源不存在' }, { status: 404 })
    const data = {
      id: r.id,
      title: r.title,
      cover: r.cover || null,
      content: r.content,
      price: r.price,
      category: r.category ? { id: r.category.id, name: r.category.name } : null,
      subcategory: r.subcategory ? { id: r.subcategory.id, name: r.subcategory.name } : null,
      tags: r.tags.map(t => ({ id: t.tagId, name: t.tag.name })),
      downloads: r.downloads.map(d => ({ id: d.id, url: d.url, code: d.code })),
    }
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '获取资源失败' }, { status: 500 })
  }
}