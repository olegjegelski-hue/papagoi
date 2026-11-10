import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { etBlogPostPathFromLocalized } from './blog-post-locale'
import { etOnlyPageAlternates, etOnlySitemapLanguages, localeUrl } from './seo'

describe('etBlogPostPathFromLocalized', () => {
  it('suunab EN ja RU postituse /et/blogi/[slug] peale', () => {
    assert.equal(
      etBlogPostPathFromLocalized('/en/blogi/manguasjad-papagoi-jaoks'),
      '/et/blogi/manguasjad-papagoi-jaoks',
    )
    assert.equal(
      etBlogPostPathFromLocalized('/ru/blogi/manguasjad-papagoi-jaoks/'),
      '/et/blogi/manguasjad-papagoi-jaoks',
    )
  })

  it('ei puutu nimekirjalehte ega ET postitust', () => {
    assert.equal(etBlogPostPathFromLocalized('/en/blogi'), null)
    assert.equal(etBlogPostPathFromLocalized('/en/blogi/'), null)
    assert.equal(etBlogPostPathFromLocalized('/ru/blogi'), null)
    assert.equal(etBlogPostPathFromLocalized('/et/blogi/manguasjad-papagoi-jaoks'), null)
    assert.equal(etBlogPostPathFromLocalized('/en/teenused'), null)
  })
})

describe('et-only hreflang', () => {
  it('annab canonical ja keeled ainult et + x-default', () => {
    const path = 'blogi/manguasjad-papagoi-jaoks'
    const etUrl = localeUrl('et', path)
    const alt = etOnlyPageAlternates(path)
    assert.equal(alt.canonical, etUrl)
    assert.deepEqual(alt.languages, { et: etUrl, 'x-default': etUrl })
    assert.equal('en' in (alt.languages || {}), false)
    assert.equal('ru' in (alt.languages || {}), false)

    const sitemapLangs = etOnlySitemapLanguages(path)
    assert.deepEqual(sitemapLangs, { et: etUrl, 'x-default': etUrl })
  })
})
