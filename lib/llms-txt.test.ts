import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GEO_LATITUDE, GEO_LONGITUDE, VISIT_PRICE_EUR, BIRTHDAY_PRICE_EUR } from './site-facts'
import { VIP_PRICE_TIERS } from './vip-visit'
import { buildLlmsFullTxt, buildLlmsTxt } from './llms-txt'
import { RISTIISA_ENABLED } from './features'

const BASE = 'https://papagoi.ee'

describe('buildLlmsTxt', () => {
  it('sisaldab ET/EN/RU sektsioone, aadressi, koordinaate ja hindu koodist', () => {
    const text = buildLlmsTxt(BASE)
    assert.match(text, /^# Papagoi Keskus/m)
    assert.match(text, /## Eesti/)
    assert.match(text, /## English/)
    assert.match(text, /## Русский/)
    assert.ok(text.includes(String(GEO_LATITUDE)))
    assert.ok(text.includes(String(GEO_LONGITUDE)))
    assert.ok(text.includes('Tartu mnt 80'))
    assert.ok(text.includes(`${VISIT_PRICE_EUR} €`))
    assert.ok(text.includes(String(BIRTHDAY_PRICE_EUR)))
    assert.ok(text.includes(`${BASE}/et/broneeri`))
    assert.ok(text.includes(`${BASE}/en/broneeri`))
    assert.ok(text.includes(`${BASE}/ru/broneeri`))
    assert.ok(text.includes('Kultuuriranits'))
    assert.ok(text.includes('#anneta'))
    assert.equal(text.includes('58.2344'), false)
    assert.equal(text.includes('58.3485'), false)
    assert.equal(text.includes('~8 km'), false)
    assert.equal(text.includes('~15 min'), false)
    assert.equal(text.includes('paremale'), false)
    assert.ok(text.includes('~6 km Tartu kesklinnast'))
    assert.ok(text.includes('~10 min'))
    assert.ok(text.includes('Vana-Linnaveere'))
    assert.ok(text.includes('linnaliin nr 7'))
    for (const tier of VIP_PRICE_TIERS) {
      assert.ok(text.includes(`${tier.price} €`))
    }
    if (!RISTIISA_ENABLED) {
      assert.equal(text.includes('ristiisa-programm'), false)
    }
    assert.equal(text.includes('/annetus'), false)
    assert.ok(text.includes('Montonio'))
    assert.ok(text.includes('pangalingiga'))
  })

  it('llms-full täiendab väljasõidu 250 € saidi hinnaga', () => {
    const full = buildLlmsFullTxt(BASE)
    assert.ok(full.includes('250 €'))
    assert.ok(full.startsWith('# Papagoi Keskus'))
    assert.ok(full.includes('Võru tänavat Ülenurme suunas'))
    assert.equal(full.includes('E263'), false)
    assert.equal(full.includes('paremale'), false)
  })
})
