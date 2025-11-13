import { NextResponse } from 'next/server'
import { getAlipay } from '@/lib/alipay'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const out_trade_no = String(body?.outTradeNo || '')
    if (!out_trade_no) return NextResponse.json({ success: false, message: '缺少订单号' }, { status: 400 })
    const alipay = await getAlipay()
    let res: any
    try {
      res = await alipay.exec('alipay.trade.query', { biz_content: { out_trade_no } })
    } catch {
      res = await alipay.exec('alipay.trade.query', { biz_content: { out_trade_no } }, { validateSign: false })
    }
    const status = res?.tradeStatus || 'UNKNOWN'
    return NextResponse.json({ success: true, data: { status, raw: res } })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || '查询失败' }, { status: 500 })
  }
}