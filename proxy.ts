import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|uploads).*)'],
}

export default async function middleware(req: NextRequest) {
  // 1. 强制 HTTPS 和 www 重定向 (仅生产环境)
  if (process.env.NODE_ENV === 'production') {
    const url = req.nextUrl.clone()
    const hostHeader = req.headers.get('host') || ''
    const hostname = hostHeader.split(':')[0] // 去除端口号
    const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
    
    // 检查是否需要重定向：非 www 或非 HTTPS
    const isWww = hostname.startsWith('www.')
    const isHttps = proto === 'https'
    
    // 如果是 localhost 或 IP 地址，不重定向
    if (hostname && !hostname.includes('localhost') && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      if (!isWww || !isHttps) {
        const newHost = isWww ? hostname : `www.${hostname}`
        // 使用字符串拼接构建绝对路径，避免 NextURL 对象处理 host 的潜在问题
        const newUrl = `https://${newHost}${url.pathname}${url.search}`
        return NextResponse.redirect(newUrl, 301)
      }
    }
  }

  // 2. CSP 安全头处理
  const nonce = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, '')
  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-nonce', nonce)
  
  const csp = [
    "default-src 'self'",
    "img-src 'self' https: data: blob:",
    "font-src 'self' https: data:",
    `script-src 'self' 'nonce-${nonce}' https: 'unsafe-eval'`, // unsafe-eval required for some Next.js dev features/libraries
    "style-src 'self' 'unsafe-inline' https:",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

  // Provide CSP in request so Next can extract nonce during SSR
  reqHeaders.set('Content-Security-Policy', csp)
  const res = NextResponse.next({ request: { headers: reqHeaders } })

  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  
  return res
}
