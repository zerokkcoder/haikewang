import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, email } = body || {}
    let usernameTaken: boolean | null = null
    let emailTaken: boolean | null = null

    if (typeof username === 'string' && username.trim()) {
      const u = await prisma.user.findUnique({ where: { username } })
      usernameTaken = !!u
    }
    if (typeof email === 'string' && email.trim()) {
      const e = await prisma.user.findUnique({ where: { email } })
      emailTaken = !!e
    }

    return NextResponse.json({ success: true, data: { usernameTaken, emailTaken } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '检查失败' }, { status: 500 })
  }
}