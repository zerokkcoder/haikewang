import { AlipaySdk } from 'alipay-sdk'

export function getAlipay() {
  const appId = process.env.ALIPAY_APP_ID
  const privateKey = process.env.ALIPAY_PRIVATE_KEY
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY
  const gateway = process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do'

  if (!appId || !privateKey) {
    throw new Error('Alipay config missing: ALIPAY_APP_ID or ALIPAY_PRIVATE_KEY')
  }
  return new AlipaySdk({
    appId,
    privateKey,
    alipayPublicKey: alipayPublicKey || '',
    gateway,
    signType: 'RSA2',
    keyType: 'PKCS8',
    camelcase: true,
    timeout: 5000,
  })
}

export function getNotifyUrl() {
  return process.env.ALIPAY_NOTIFY_URL || ''
}