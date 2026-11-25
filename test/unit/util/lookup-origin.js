'use strict'

const { default: test } = require('ava')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const load = ({ token = 'token', body, lookupAsync } = {}) => {
  const calls = []
  const createLookupOrigin = proxyquire('../../../src/util/lookup-origin', {
    got: {
      extend: () => (path, opts) => {
        calls.push({ path, ip: opts.searchParams.ip })
        return Promise.resolve(body)
      }
    }
  })
  createLookupOrigin.cache.clear()
  const lookupOrigin = createLookupOrigin({
    token,
    timeout: 1000,
    cacheableLookup: {
      lookupAsync: lookupAsync || (async () => [{ address: '23.33.42.82' }])
    }
  })
  return { lookupOrigin, calls }
}

test('lookupOrigin reads the asn once per address', async t => {
  const { lookupOrigin, calls } = load({
    body: { result: { ip: { asn: '20940' } } }
  })

  const first = await lookupOrigin('https://example.com/user')
  const second = await lookupOrigin('https://example.com/other')

  t.deepEqual(first, { asn: '20940' })
  t.is(second, first)
  t.deepEqual(calls, [{ path: 'entities/ip', ip: '23.33.42.82' }])
})

test('lookupOrigin skips a reserved address', async t => {
  const { lookupOrigin, calls } = load({
    body: { result: { ip: { asn: '20940' } } }
  })

  t.is(await lookupOrigin('http://127.0.0.1/'), undefined)
  t.deepEqual(calls, [])
})

test('lookupOrigin does nothing without a token', async t => {
  const { lookupOrigin, calls } = load({ token: null })

  t.is(await lookupOrigin('https://example.com/user'), undefined)
  t.deepEqual(calls, [])
})
