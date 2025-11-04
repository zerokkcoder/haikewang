import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import jwt from 'jsonwebtoken'

async function ensureTables() {
  const pool = await getPool()
  // categories table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(128) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  // subcategories table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(128) NOT NULL,
      sort INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cat (category_id),
      CONSTRAINT fk_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
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
  const url = new URL(req.url)
  const categoryId = Number(url.searchParams.get('categoryId'))
  if (!categoryId) {
    return NextResponse.json({ success: false, message: '缺少 categoryId' }, { status: 400 })
  }
  const pool = await ensureTables()
  const [rows] = await pool.query<any[]>(`SELECT id, name, sort, created_at FROM subcategories WHERE category_id = ? ORDER BY sort ASC, id DESC`, [categoryId])
  return NextResponse.json({ success: true, data: rows })
}

export async function POST(req: Request) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  const { categoryId, name, sort } = await req.json()
  if (!categoryId || !name || String(name).trim() === '') {
    return NextResponse.json({ success: false, message: '参数错误' }, { status: 400 })
  }
  const pool = await ensureTables()
  try {
    const sortNum = Number.isFinite(Number(sort)) ? Number(sort) : 0
    const [result]: any = await pool.query(`INSERT INTO subcategories (category_id, name, sort) VALUES (?, ?, ?)`, [Number(categoryId), String(name).trim(), sortNum])
    const [rows] = await pool.query<any[]>(`SELECT id, name, sort, created_at FROM subcategories WHERE id = ?`, [result.insertId])
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '创建失败' }, { status: 500 })
  }
}