import crypto from 'node:crypto'
import http from 'node:http'
import dotenv from 'dotenv'

dotenv.config()

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/business.manage'
const CALLBACK_PORT = 3456
const CALLBACK_PATH = '/oauth2callback'
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`

function maskClientId(clientId: string): string {
  const [prefix, rest] = clientId.split('-', 2)
  if (!rest) return '(tundmatu client id)'
  return `${prefix}-…apps.googleusercontent.com`
}

function htmlPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="et">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; line-height: 1.5;">
    <h1>${title}</h1>
    <p>${body}</p>
  </body>
</html>`
}

async function exchangeCode(opts: {
  code: string
  clientId: string
  clientSecret: string
}): Promise<{ refresh_token?: string; error?: string; error_description?: string }> {
  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  })

  const text = await tokenRes.text()
  let data: {
    refresh_token?: string
    error?: string
    error_description?: string
  }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error(`Token vastus polnud JSON (HTTP ${tokenRes.status})`)
  }

  return data
}

async function main() {
  const clientId = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Puudub GOOGLE_MY_BUSINESS_CLIENT_ID või GOOGLE_MY_BUSINESS_CLIENT_SECRET .env failis')
    process.exit(1)
  }

  const state = crypto.randomBytes(24).toString('hex')
  const authUrl = new URL(AUTH_ENDPOINT)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', SCOPE)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  authUrl.searchParams.set('state', state)

  const result = await new Promise<{ refreshToken: string }>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url ?? '/', `http://localhost:${CALLBACK_PORT}`)
        if (reqUrl.pathname !== CALLBACK_PATH) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Not found')
          return
        }

        const error = reqUrl.searchParams.get('error')
        if (error) {
          const description = reqUrl.searchParams.get('error_description') ?? error
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(htmlPage('OAuth katkestati', description))
          server.close()
          reject(new Error(`Google OAuth viga: ${description}`))
          return
        }

        const returnedState = reqUrl.searchParams.get('state')
        const code = reqUrl.searchParams.get('code')
        if (!returnedState || returnedState !== state || !code) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(htmlPage('Vigane callback', 'state või code puudub. Proovi skript uuesti käivitada.'))
          server.close()
          reject(new Error('Vigane OAuth callback (state/code)'))
          return
        }

        const data = await exchangeCode({ code, clientId, clientSecret })
        if (data.error || !data.refresh_token) {
          const message = data.error_description || data.error || 'refresh_token puudub vastuses'
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(
            htmlPage(
              'Tokenit ei saadud',
              'Vaata terminali. Tavaliselt aitab prompt=consent ja et Google Cloud Web clientil on täpne redirect URI.',
            ),
          )
          server.close()
          reject(new Error(message))
          return
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(htmlPage('Valmis', 'Refresh token on terminalis. Selle akna võid sulgeda.'))
        server.close(() => resolve({ refreshToken: data.refresh_token as string }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(htmlPage('Viga', 'Vaata terminali.'))
        server.close()
        reject(err)
      }
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Port ${CALLBACK_PORT} on hõivatud. Sulge teine protsess või vabasta port, siis käivita skript uuesti.`,
          ),
        )
        return
      }
      reject(err)
    })

    server.listen(CALLBACK_PORT, () => {
      console.log('--- Google My Business Web OAuth ---')
      console.log(`Client: ${maskClientId(clientId)}`)
      console.log(`Scope: ${SCOPE}`)
      console.log(`Redirect URI (lisa täpselt Google Cloud Web clientisse):`)
      console.log(`  ${REDIRECT_URI}`)
      console.log('')
      console.log('Ava brauseris see consent URL:')
      console.log(authUrl.toString())
      console.log('')
      console.log(`Ootan callbacki ${REDIRECT_URI} ...`)
    })
  })

  console.log('')
  console.log('GOOGLE_MY_BUSINESS_REFRESH_TOKEN=' + result.refreshToken)
  console.log('')
  console.log('Lisa see rida .env faili (ära commitita). Productionis uuenda ka Verceli env.')
}

main().catch((err) => {
  console.error('Viga:', err instanceof Error ? err.message : err)
  process.exit(1)
})
