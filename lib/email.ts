import { SMTPClient } from 'smtp-client'

type SendEmailArgs = {
  to: string
  subject: string
  html: string
  text: string
}

type SMTPClientConfig = ConstructorParameters<typeof SMTPClient>[0] & {
  secure?: boolean
  timeout?: number
}

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/)
  return sanitizeHeaderValue(match ? match[1] : value)
}

function encodeDisplayName(name: string) {
  return `=?UTF-8?B?${Buffer.from(name, 'utf8').toString('base64')}?=`
}

function resolveFromAddress(user?: string) {
  const configuredFrom = (process.env.SMTP_FROM as string | undefined)?.trim()
  const configuredName = (process.env.SMTP_FROM_NAME as string | undefined)?.trim()
  const fallbackEmail = user ?? 'no-reply@example.com'

  if (configuredFrom) {
    const envelopeFrom = extractEmailAddress(configuredFrom)
    if (configuredName) {
      return {
        envelopeFrom,
        headerFrom: `${encodeDisplayName(configuredName)} <${envelopeFrom}>`,
      }
    }

    return {
      envelopeFrom,
      headerFrom: sanitizeHeaderValue(configuredFrom),
    }
  }

  if (configuredName) {
    return {
      envelopeFrom: fallbackEmail,
      headerFrom: `${encodeDisplayName(configuredName)} <${fallbackEmail}>`,
    }
  }

  return {
    envelopeFrom: fallbackEmail,
    headerFrom: fallbackEmail,
  }
}

function hasExtension(client: SMTPClient, extension: string) {
  return (client as unknown as { hasExtension: (value: string) => boolean }).hasExtension(extension)
}

export function canSendEmail() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    (process.env.SMTP_USER || process.env.SMTP_FROM) &&
    (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_SECURE === 'false')
  )
}

export async function sendSmtpEmail({ to, subject, html, text }: SendEmailArgs) {
  const host = process.env.SMTP_HOST as string
  const port = Number(process.env.SMTP_PORT ?? 587)
  const secure = (process.env.SMTP_SECURE ?? 'false') === 'true' || port === 465
  const user = process.env.SMTP_USER as string | undefined
  const pass = (process.env.SMTP_PASS as string | undefined) ?? (process.env.SMTP_PASSWORD as string | undefined)
  const { envelopeFrom, headerFrom } = resolveFromAddress(user)

  const client = new SMTPClient({
    host,
    port,
    secure,
  } as SMTPClientConfig)

  try {
    await client.connect()
    await client.greet({ hostname: host })

    // Port 587 usually requires STARTTLS before SMTP auth.
    if (!secure && hasExtension(client, 'STARTTLS')) {
      await client.secure()
      await client.greet({ hostname: host })
    }

    if (user && pass) {
      const mechanisms = client.getAuthMechanisms()
      if (mechanisms.includes('PLAIN')) {
        await client.authPlain({ username: user, password: pass })
      } else if (mechanisms.includes('LOGIN')) {
        await client.authLogin({ username: user, password: pass })
      } else {
        throw new Error('SMTP server does not support LOGIN/PLAIN authentication')
      }
    }

    await client.mail({ from: envelopeFrom })
    await client.rcpt({ to: sanitizeHeaderValue(to) })
    await client.data(
      [
        `From: ${headerFrom}`,
        `To: ${sanitizeHeaderValue(to)}`,
        `Subject: ${sanitizeHeaderValue(subject)}`,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="boundary_xuehaoke"',
        '',
        '--boundary_xuehaoke',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        text,
        '',
        '--boundary_xuehaoke',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        html,
        '',
        '--boundary_xuehaoke--',
      ].join('\r\n')
    )
  } finally {
    await client.quit().catch(() => undefined)
  }
}
