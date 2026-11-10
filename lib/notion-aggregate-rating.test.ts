import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  aggregateRatingFromHinneValues,
  hinneFromNotionProperty,
  hinneValuesFromPages,
} from './notion-aggregate-rating'
import type { NotionReviewPage } from './notion-reviews-query'

describe('hinneFromNotionProperty', () => {
  it('võtab 1–5 numbri, hülgab muu', () => {
    assert.equal(hinneFromNotionProperty({ number: 5 }), 5)
    assert.equal(hinneFromNotionProperty({ number: 1 }), 1)
    assert.equal(hinneFromNotionProperty({ number: 0 }), null)
    assert.equal(hinneFromNotionProperty({ number: 6 }), null)
    assert.equal(hinneFromNotionProperty({ number: null }), null)
    assert.equal(hinneFromNotionProperty(undefined), null)
  })
})

describe('aggregateRatingFromHinneValues', () => {
  it('arvutab keskmise ühe komakohaga, ilma fallback 5.0/801-ta', () => {
    const rating = aggregateRatingFromHinneValues([5, 5, 4, 5])
    assert.deepEqual(rating, {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '4',
    })
  })

  it('tühja nimekirja korral null (mitte vana number)', () => {
    assert.equal(aggregateRatingFromHinneValues([]), null)
  })
})

describe('hinneValuesFromPages', () => {
  it('võtab ainult kehtiva Hinne välja', () => {
    const pages: NotionReviewPage[] = [
      { id: 'a', properties: { Hinne: { number: 5 } } },
      { id: 'b', properties: { Hinne: { number: null } } },
      { id: 'c', properties: {} },
      { id: 'd', properties: { Hinne: { number: 4 } } },
    ]
    assert.deepEqual(hinneValuesFromPages(pages), [5, 4])
  })
})
