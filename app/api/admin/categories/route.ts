import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import jwt from 'jsonwebtoken'

async function ensureTable() {
  const pool = await getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(128) NOT NULL UNIQUE,
      sort INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  return pool
}

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

export async function GET(req: Request) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const pool = await ensureTable()
  const [rows] = await pool.query<any[]>(`SELECT id, name, sort, created_at FROM categories ORDER BY sort ASC, id DESC`)
  return NextResponse.json({ success: true, data: rows })
}

export async function POST(req: Request) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const { name, sort } = await req.json()
  if (!name || String(name).trim() === '') {
    return NextResponse.json({ success: false, message: '名称不能为空' }, { status: 400 })
  }
  const pool = await ensureTable()
  try {
    const sortNum = Number.isFinite(Number(sort)) ? Number(sort) : 0
    const [result]: any = await pool.query(`INSERT INTO categories (name, sort) VALUES (?, ?)`, [String(name).trim(), sortNum])
    const [rows] = await pool.query<any[]>(`SELECT id, name, sort, created_at FROM categories WHERE id = ?`, [result.insertId])
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '创建失败' }, { status: 500 })
  }
}