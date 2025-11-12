import { NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: parts } = await params
    const rel = Array.isArray(parts) ? parts.join('/') : ''
    if (!rel) return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 })
    const baseDir = path.join(process.cwd(), 'storage', 'uploads')
    const abs = path.join(baseDir, rel)
    const resolvedBase = path.resolve(baseDir)
    const resolvedAbs = path.resolve(abs)
    if (!resolvedAbs.startsWith(resolvedBase)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    await stat(abs)
    const buf = await readFile(abs)
    const ext = path.extname(abs).toLowerCase()
    let ct = 'application/octet-stream'
    if (ext === '.png') ct = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') ct = 'image/jpeg'
    else if (ext === '.webp') ct = 'image/webp'
    return new NextResponse(buf, { headers: { 'Content-Type': ct, 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Not Found' }, { status: 404 })
  }
}