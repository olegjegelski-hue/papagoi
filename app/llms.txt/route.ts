import { buildLlmsTxt } from '@/lib/llms-txt'
import { getSiteUrl } from '@/lib/seo'

export const revalidate = 86400

export function GET() {
  const body = buildLlmsTxt(getSiteUrl())
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
