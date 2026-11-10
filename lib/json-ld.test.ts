import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GEO_LATITUDE, GEO_LONGITUDE, GOOGLE_PLACE_ID } from './site-facts'
import { VIP_PRICE_TIERS } from './vip-visit'
import { buildSiteJsonLdGraph, jsonLdId, localBusinessEntities } from './json-ld'

const BASE = 'https://papagoi.ee'

describe('buildSiteJsonLdGraph', () => {
  it('annab ühe LocalBusiness olemi @id #business ja tüüpidega Zoo', () => {
    const graph = buildSiteJsonLdGraph(BASE, null)
    const businesses = localBusinessEntities(graph)
    assert.equal(businesses.length, 1)
    const biz = businesses[0] as {
      '@id': string
      '@type': string[]
      parentOrganization: { '@id': string }
      publisher: { '@id': string }
      geo: { latitude: number; longitude: number }
      hasMap: string
      availableLanguage: string[]
      knowsLanguage: string[]
      aggregateRating?: unknown
    }
    assert.equal(biz['@id'], jsonLdId(BASE, 'business'))
    assert.deepEqual(biz['@type'].slice().sort(), [
      'LocalBusiness',
      'TouristAttraction',
      'Zoo',
    ].sort())
    assert.equal(biz.parentOrganization['@id'], jsonLdId(BASE, 'organization'))
    assert.equal(biz.publisher['@id'], jsonLdId(BASE, 'organization'))
    assert.equal(biz.geo.latitude, GEO_LATITUDE)
    assert.equal(biz.geo.longitude, GEO_LONGITUDE)
    assert.ok(biz.hasMap.includes(GOOGLE_PLACE_ID))
    assert.deepEqual(biz.availableLanguage, ['Estonian', 'English', 'Russian'])
    assert.deepEqual(biz.knowsLanguage, ['Estonian', 'English', 'Russian'])
    assert.equal(biz.aggregateRating, undefined)
  })

  it('lisab aggregateRating ainult kui Notion andis hinne', () => {
    const graph = buildSiteJsonLdGraph(BASE, {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '812',
    })
    const biz = localBusinessEntities(graph)[0] as {
      aggregateRating: { ratingValue: string; ratingCount: string }
    }
    assert.equal(biz.aggregateRating.ratingValue, '4.9')
    assert.equal(biz.aggregateRating.ratingCount, '812')
  })

  it('makesOffer kasutab saidi hindu (10 / 350 / VIP astmed / kinkekaart)', () => {
    const graph = buildSiteJsonLdGraph(BASE, null)
    const biz = localBusinessEntities(graph)[0] as { makesOffer: Array<Record<string, unknown>> }
    const prices = biz.makesOffer.flatMap((offer) => {
      if (offer['@type'] === 'AggregateOffer') {
        const nested = (offer.offers as Array<{ price: string }>) || []
        return [offer.lowPrice, offer.highPrice, ...nested.map((row) => row.price)]
      }
      return [offer.price]
    })
    assert.ok(prices.includes('10'))
    assert.ok(prices.includes('350'))
    for (const tier of VIP_PRICE_TIERS) {
      assert.ok(prices.includes(String(tier.price)), `puudu VIP ${tier.price}`)
    }
    assert.equal(
      prices.includes('250'),
      false,
      'väljasõidu 250 € ei kuulu makesOffer nimekirja',
    )
  })

  it('ei kasuta vana vale koordinaati', () => {
    const raw = JSON.stringify(buildSiteJsonLdGraph(BASE, null))
    assert.equal(raw.includes('58.2344'), false)
    assert.equal(raw.includes('26.7250'), false)
  })

  it('WebSite ja Organization viitavad @id-ga', () => {
    const graph = buildSiteJsonLdGraph(BASE, null)
    const nodes = graph['@graph'] as Array<Record<string, unknown>>
    const org = nodes.find((n) => n['@type'] === 'Organization') as {
      '@id': string
    }
    const web = nodes.find((n) => n['@type'] === 'WebSite') as {
      publisher: { '@id': string }
      about: { '@id': string }
    }
    assert.equal(org['@id'], jsonLdId(BASE, 'organization'))
    assert.equal(web.publisher['@id'], jsonLdId(BASE, 'organization'))
    assert.equal(web.about['@id'], jsonLdId(BASE, 'business'))
  })
})
