import { NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/cron-auth'
import { rewriteGmbReviewReplies } from '@/scripts/rewrite-gmb-review-replies'

/**
 * Käsitsi vanade postitamata GMB vastuste AI rewrite. EI ole vercel.json cronis.
 * Vaikimisi dry-run; kirjutamiseks: ?apply=1
 * Default batch: ainult Staatus=Uus. Mustand loodud uuesti: reviewId/pageId + force=1
 * Soovitatav apply limit=5 (max 20). Google’isse ei postita.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function collectCsvParams(url: URL, names: string[]): string[] {
  const out: string[] = []
  for (const name of names) {
    for (const value of url.searchParams.getAll(name)) {
      out.push(
        ...value
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      )
    }
  }
  return out
}

export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    const url = new URL(request.url)
    const apply = url.searchParams.get('apply') === '1'
    const dryRun = url.searchParams.get('dryRun') === '1' || url.searchParams.get('dry') === '1' || !apply
    const force = url.searchParams.get('force') === '1'
    const limitRaw = url.searchParams.get('limit')
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined
    const reviewIds = collectCsvParams(url, ['reviewId', 'reviewIds'])
    const pageIds = collectCsvParams(url, ['pageId', 'pageIds'])

    const summary = await rewriteGmbReviewReplies({
      dryRun,
      force,
      limit: limit != null && Number.isFinite(limit) && limit > 0 ? limit : undefined,
      reviewIds: reviewIds.length > 0 ? reviewIds : undefined,
      pageIds: pageIds.length > 0 ? pageIds : undefined,
    })
    return NextResponse.json({ ok: true, ...summary })
  } catch (error) {
    console.error('GMB reply rewrite failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
