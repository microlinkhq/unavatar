'use strict'

const { default: test } = require('ava')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const load = ({ token = 'token', body, lookupAsync, radarError } = {}) => {
  const calls = []
  const clients = []
  const createLookupOrigin = proxyquire('../../../src/util/lookup-origin', {
    got: {
      extend: opts => {
        clients.push(opts)
        return (path, req) => {
          calls.push({ path, ip: req.searchParams.ip })
          if (radarError) return Promise.reject(radarError)
          return Promise.resolve(body)
        }
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
  return { lookupOrigin, calls, clients }
}

test('lookupOrigin calls radar with the bearer token and no retry', async t => {
  const { lookupOrigin, clients } = load({
    token: 'secret',
    body: { result: { ip: { asn: '20940' } } }
  })

  await lookupOrigin('https://example.com/user')

  t.deepEqual(clients, [
    {
      prefixUrl: 'https://api.cloudflare.com/client/v4/radar/',
      responseType: 'json',
      resolveBodyOnly: true,
      timeout: { request: 1000 },
      retry: { limit: 0 },
      headers: {
        authorization: 'Bearer secret',
        'user-agent': undefined
      }
    }
  ])
  t.true(Object.hasOwn(clients[0].headers, 'user-agent'))
})

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

test('lookupOrigin ignores a dns failure', async t => {
  const { lookupOrigin, calls } = load({
    lookupAsync: async () => {
      throw new Error('dns')
    }
  })

  t.is(await lookupOrigin('https://example.com/user'), undefined)
  t.deepEqual(calls, [])
})

test('lookupOrigin does not cache a radar failure', async t => {
  const { lookupOrigin, calls } = load({ radarError: new Error('radar') })

  t.is(await lookupOrigin('https://example.com/user'), undefined)
  t.is(await lookupOrigin('https://example.com/other'), undefined)
  t.deepEqual(calls, [
    { path: 'entities/ip', ip: '23.33.42.82' },
    { path: 'entities/ip', ip: '23.33.42.82' }
  ])
})

test('lookupOrigin remembers an address with no asn', async t => {
  const { lookupOrigin, calls } = load({ body: {} })

  const first = await lookupOrigin('https://example.com/user')
  const second = await lookupOrigin('https://example.com/other')

  t.is(first.asn, undefined)
  t.is(second, first)
  t.deepEqual(calls, [{ path: 'entities/ip', ip: '23.33.42.82' }])
})
