import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { canSendEmail, sendSmtpEmail } from '@/lib/email'

function generateCode(len = 6) {
  let s = ''
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10)
  return s
}

async function sendEmailCode(to: string, code: string) {
  const subject = '您的注册验证码'
  const html = `
    <p>您好！</p>
    <p>您的注册验证码为：<strong>${code}</strong></p>
    <p>该验证码在 5 分钟内有效，请尽快完成验证。</p>
    <p>如非本人操作，请忽略此邮件。</p>
  `
  await sendSmtpEmail({ to, subject, html, text: `您的注册验证码为：${code}（5分钟内有效）` })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email: string = (body?.email || '').trim()
    if (!email) return NextResponse.json({ success: false, message: '邮箱不能为空' }, { status: 400 })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ success: false, message: '邮箱已注册' }, { status: 400 })

    const code = generateCode(6)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await prisma.emailVerification.create({ data: { email, code, expiresAt, used: false } })

    const sendRealEmail = process.env.SEND_REAL_EMAIL
    if (sendRealEmail && canSendEmail()) {
      try {
        await sendEmailCode(email, code)
        // 真实环境：不在响应体中返回验证码
        return NextResponse.json({ success: true, data: { email, expiresAt } })
      } catch (e: any) {
        // 邮件发送失败，仍允许用户稍后重试
        return NextResponse.json({ success: false, message: e?.message || '邮件发送失败，请稍后再试' }, { status: 500 })
      }
    }

    // 开发环境或未配置邮件：直接返回验证码，便于测试
    console.log(`[send-code] email=${email} code=${code}`) // eslint-disable-line no-console
    return NextResponse.json({ success: true, data: { email, code, expiresAt } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '发送验证码失败' }, { status: 500 })
  }
}
