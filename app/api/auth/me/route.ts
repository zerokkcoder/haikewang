import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(req: Request) {
  try {
    const cookieHeader = (req as any).headers.get('cookie') || ''
    const match = cookieHeader.match(/site_token=([^;]+)/)
    const token = match ? match[1] : ''
    if (!token) return NextResponse.json({ authenticated: false }, { status: 200 })
    const secret = process.env.SITE_JWT_SECRET || 'site_dev_secret_change_me'
    const payload = jwt.verify(token, secret) as any
    return NextResponse.json({ authenticated: true, user: { id: payload?.uid, username: payload?.username } })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}