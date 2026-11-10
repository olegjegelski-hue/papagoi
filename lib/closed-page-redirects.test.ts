import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { annetusRedirect, ristiisaRedirect } from './closed-page-redirects'

describe('ristiisaRedirect', () => {
  it('307 /{locale}/toetused kui programm on suletud', () => {
    assert.deepEqual(ristiisaRedirect('/et/ristiisa-programm', false), {
      pathname: '/et/toetused',
      status: 307,
    })
    assert.deepEqual(ristiisaRedirect('/en/ristiisa-programm/', false), {
      pathname: '/en/toetused',
      status: 307,
    })
    assert.deepEqual(ristiisaRedirect('/ru/ristiisa-programm', false), {
      pathname: '/ru/toetused',
      status: 307,
    })
    assert.deepEqual(ristiisaRedirect('/ristiisa-programm', false), {
      pathname: '/et/toetused',
      status: 307,
    })
  })

  it('ei suuna, kui lipp on sees', () => {
    assert.equal(ristiisaRedirect('/et/ristiisa-programm', true), null)
    assert.equal(ristiisaRedirect('/ristiisa-programm', true), null)
  })

  it('ei puutu teisi teid', () => {
    assert.equal(ristiisaRedirect('/et/toetused', false), null)
    assert.equal(ristiisaRedirect('/et/papagoid', false), null)
  })
})

describe('annetusRedirect', () => {
  it('308 /{locale}/toetused#anneta, ka ilma keeleta', () => {
    assert.deepEqual(annetusRedirect('/et/annetus'), {
      pathname: '/et/toetused',
      status: 308,
      hash: '#anneta',
    })
    assert.deepEqual(annetusRedirect('/ru/annetus/'), {
      pathname: '/ru/toetused',
      status: 308,
      hash: '#anneta',
    })
    assert.deepEqual(annetusRedirect('/annetus'), {
      pathname: '/et/toetused',
      status: 308,
      hash: '#anneta',
    })
  })

  it('ei puutu /toetused ega alamteid', () => {
    assert.equal(annetusRedirect('/et/toetused'), null)
    assert.equal(annetusRedirect('/et/annetus/foo'), null)
  })
})
