import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
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
  const { name, sort } = await req.json()
  if (!name || String(name).trim() === '') {
    return NextResponse.json({ success: false, message: '名称不能为空' }, { status: 400 })
  }
  const { id } = await params
  const idNum = Number.parseInt(id, 10)
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ success: false, message: '无效的子分类ID' }, { status: 400 })
  }
  const pool = await getPool()
  try {
    const [curRows] = await pool.query<any[]>(`SELECT sort FROM subcategories WHERE id = ?`, [idNum])
    const currentSort = ((curRows as any[])[0]?.sort) ?? 0
    const sortNum = Number.isFinite(Number(sort)) ? Number(sort) : currentSort
    await pool.query(`UPDATE subcategories SET name = ?, sort = ? WHERE id = ?`, [String(name).trim(), sortNum, idNum])
    const [rows] = await pool.query<any[]>(`SELECT id, name, sort, created_at FROM subcategories WHERE id = ?`, [idNum])
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '更新失败' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const idNum = Number.parseInt(id, 10)
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ success: false, message: '无效的子分类ID' }, { status: 400 })
  }
  const pool = await getPool()
  try {
    await pool.query(`DELETE FROM subcategories WHERE id = ?`, [idNum])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '删除失败' }, { status: 500 })
  }
}