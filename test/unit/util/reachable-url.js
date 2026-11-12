'use strict'

const { default: test } = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

test('reachable-url pings with merged got options and keeps url and statusCode', async t => {
  const ping = sinon.stub().resolves({
    statusCode: 200,
    url: 'https://example.com',
    headers: { 'content-type': 'image/png' }
  })
  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({
    got: { gotOpts: { timeout: 1234, retry: { limit: 0 } } },
    pingCache: {}
  })

  const value = await reachableUrl('https://example.com/avatar.png', {
    retry: { limit: 1 }
  })

  t.deepEqual(value, { statusCode: 200, url: 'https://example.com' })
  t.true(
    ping.calledOnceWithExactly('https://example.com/avatar.png', {
      timeout: 1234,
      retry: { limit: 1 },
      context: {}
    })
  )
  t.true(reachableUrl.isReachable())
})

test('reports the address a refused redirect was pointing at', async t => {
  const ping = sinon.stub().callsFake(async (url, { context }) => {
    context.reservedAddress = '127.0.0.1'
    return { statusCode: 302, url }
  })

  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({ got: { gotOpts: {} }, pingCache: {} })

  t.deepEqual(await reachableUrl('https://attacker.com/avatar.png'), {
    statusCode: 404,
    url: 'https://attacker.com/avatar.png',
    reservedAddress: '127.0.0.1'
  })
})

test('treats a bare redirect status as unreachable', async t => {
  const ping = sinon.stub().resolves({
    statusCode: 302,
    url: 'https://attacker.com/avatar.png'
  })

  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({ got: { gotOpts: {} }, pingCache: {} })

  t.deepEqual(await reachableUrl('https://attacker.com/avatar.png'), {
    statusCode: 404,
    url: 'https://attacker.com/avatar.png'
  })
})

test('a request that is not refused carries no reserved address', async t => {
  const ping = sinon
    .stub()
    .resolves({ statusCode: 200, url: 'https://example.com' })

  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({ got: { gotOpts: {} }, pingCache: {} })

  t.deepEqual(await reachableUrl('https://example.com/avatar.png'), {
    statusCode: 200,
    url: 'https://example.com'
  })
})

test('each call gets its own context', async t => {
  const contexts = []
  const ping = sinon.stub().callsFake(async (url, { context }) => {
    contexts.push(context)
    return { statusCode: 200, url }
  })

  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({ got: { gotOpts: {} }, pingCache: {} })

  await Promise.all([
    reachableUrl('https://a.example/avatar.png'),
    reachableUrl('https://b.example/avatar.png')
  ])

  t.is(contexts.length, 2)
  t.not(contexts[0], contexts[1])
})

test('a failed ping is not swallowed or cached', async t => {
  const ping = sinon.stub().rejects(new Error('dns failed'))
  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({ got: { gotOpts: {} }, pingCache: {} })

  const url = 'https://example.com/avatar.png'
  await t.throwsAsync(reachableUrl(url), { message: 'dns failed' })
  await t.throwsAsync(reachableUrl(url), { message: 'dns failed' })
  t.is(ping.callCount, 2)
})

test('a rate limit without headers is still cached', async t => {
  const url = 'https://example.com/limited'
  const ping = sinon.stub().resolves({ statusCode: 429, url })
  ping.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    'reachable-url': ping
  })({ got: { gotOpts: {} }, pingCache: {} })

  t.deepEqual(await reachableUrl(url), { statusCode: 429, url })
  ping.resolves({ statusCode: 200, url })
  t.deepEqual(await reachableUrl(url), { statusCode: 429, url })
  t.true(ping.calledOnce)
})

const createRealPing = async t => {
  const http = require('http')
  const ms = require('ms')
  const { createMultiCache, createRedisCache } =
    require('../../../src/util/keyv')({
      TTL_DEFAULT: ms('28d')
    })
  const { pingCache } = require('../../../src/util/cache')({
    createMultiCache,
    createRedisCache
  })
  const reachableUrl = require('../../../src/util/reachable-url')({
    got: { gotOpts: { retry: { limit: 0 } } },
    pingCache
  })

  const statusByPath = new Map()
  const headersByPath = new Map()
  const server = http.createServer((req, res) => {
    res.statusCode = statusByPath.get(req.url) ?? Number(req.url.slice(1))
    for (const [name, value] of Object.entries(
      headersByPath.get(req.url) ?? {}
    )) {
      res.setHeader(name, value)
    }
    res.end()
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.teardown(() => server.close())
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  const storedTtl = async url => {
    const { remote } = pingCache.store
    const raw = await remote.store.get(remote._getKeyPrefix(url))
    if (raw === undefined) return undefined
    return JSON.parse(raw).expires - Date.now()
  }

  const isCached = async url => (await storedTtl(url)) !== undefined

  return {
    reachableUrl,
    baseUrl,
    isCached,
    storedTtl,
    statusByPath,
    headersByPath
  }
}

const assertTtl = (t, remaining, expected, label) =>
  t.true(
    remaining > expected - 5000 && remaining <= expected,
    `${label}: ${remaining}ms`
  )

test('caches pings for a day, rate limits briefly and refusals not at all', async t => {
  const ms = require('ms')
  const { reachableUrl, baseUrl, storedTtl } = await createRealPing(t)

  const expectations = [
    [200, ms('1d')],
    [404, ms('1d')],
    [429, ms('1m')],
    [403, undefined],
    [408, undefined],
    [500, undefined],
    [503, undefined]
  ]

  for (const [statusCode, ttl] of expectations) {
    const url = `${baseUrl}/${statusCode}`
    const response = await reachableUrl(url)
    t.deepEqual(response, { url, statusCode })
    const remaining = await storedTtl(url)
    if (ttl === undefined) t.is(remaining, undefined, String(statusCode))
    else assertTtl(t, remaining, ttl, String(statusCode))
  }
})

test('a rate limited ping is cached for its Retry-After', async t => {
  const ms = require('ms')
  const { reachableUrl, baseUrl, storedTtl, statusByPath, headersByPath } =
    await createRealPing(t)
  const url = `${baseUrl}/limited.png`
  statusByPath.set('/limited.png', 429)
  headersByPath.set('/limited.png', { 'retry-after': '120' })

  t.deepEqual(await reachableUrl(url), { url, statusCode: 429 })
  assertTtl(t, await storedTtl(url), ms('2m'), 'retry-after 120')

  statusByPath.set('/limited.png', 200)
  t.deepEqual(await reachableUrl(url), { url, statusCode: 429 })
})

test('rate limit TTL follows Retry-After within bounds', t => {
  const ms = require('ms')
  const { rateLimitTtl } = require('../../../src/util/reachable-url')
  const inSeconds = seconds =>
    new Date(Date.now() + seconds * 1000).toUTCString()

  t.is(rateLimitTtl(undefined), ms('1m'))
  t.is(rateLimitTtl(''), ms('1m'))
  t.is(rateLimitTtl('   '), ms('1m'))
  t.is(rateLimitTtl('\n'), ms('1m'))
  t.is(rateLimitTtl('\uFEFF'), ms('1m'))
  t.is(rateLimitTtl('soon'), ms('1m'))
  t.is(rateLimitTtl('30'), ms('30s'))
  t.is(rateLimitTtl('120, 60'), ms('2m'))
  t.is(rateLimitTtl('0'), ms('1s'))
  t.is(rateLimitTtl('-5'), ms('1s'))
  t.is(rateLimitTtl('86400'), ms('10m'))
  t.is(rateLimitTtl(new Date(Date.now() - ms('1h')).toUTCString()), ms('1s'))
  t.is(rateLimitTtl(inSeconds(36000)), ms('10m'))
  const fromDate = rateLimitTtl(inSeconds(90))
  t.true(fromDate > ms('88s') && fromDate <= ms('90s'), String(fromDate))
})

test('a host that refused once serves the avatar on the next ping', async t => {
  const { reachableUrl, baseUrl, isCached, statusByPath } =
    await createRealPing(t)
  const url = `${baseUrl}/avatar.png`

  statusByPath.set('/avatar.png', 403)
  t.is((await reachableUrl(url)).statusCode, 403)

  statusByPath.set('/avatar.png', 200)
  t.is((await reachableUrl(url)).statusCode, 200)
  t.true(await isCached(url))

  statusByPath.set('/avatar.png', 403)
  t.is((await reachableUrl(url)).statusCode, 200)
})
