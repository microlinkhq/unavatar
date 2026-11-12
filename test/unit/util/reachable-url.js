'use strict'

const { default: test } = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

test('reachable-url composes ping-url with cache and merged got options', async t => {
  const ping = sinon
    .stub()
    .resolves({ statusCode: 200, url: 'https://example.com' })
  const pingCache = { name: 'ping-cache' }

  const createPingUrl = sinon.stub().callsFake((cache, opts) => {
    t.deepEqual(cache, pingCache)
    t.is(typeof opts.value, 'function')
    t.deepEqual(
      opts.value({
        url: 'https://example.com',
        statusCode: 200,
        ignored: true
      }),
      {
        url: 'https://example.com',
        statusCode: 200
      }
    )
    return ping
  })
  createPingUrl.isReachable = sinon.stub().returns(true)

  const reachableUrlFactory = proxyquire('../../../src/util/reachable-url', {
    '@microlink/ping-url': createPingUrl
  })

  const reachableUrl = reachableUrlFactory({
    got: { gotOpts: { timeout: 1234, retry: { limit: 0 } } },
    pingCache
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

  const createPingUrl = sinon.stub().returns(ping)
  createPingUrl.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    '@microlink/ping-url': createPingUrl
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

  const createPingUrl = sinon.stub().returns(ping)
  createPingUrl.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    '@microlink/ping-url': createPingUrl
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

  const createPingUrl = sinon.stub().returns(ping)
  createPingUrl.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    '@microlink/ping-url': createPingUrl
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

  const createPingUrl = sinon.stub().returns(ping)
  createPingUrl.isReachable = sinon.stub().returns(true)

  const reachableUrl = proxyquire('../../../src/util/reachable-url', {
    '@microlink/ping-url': createPingUrl
  })({ got: { gotOpts: {} }, pingCache: {} })

  await Promise.all([
    reachableUrl('https://a.example/avatar.png'),
    reachableUrl('https://b.example/avatar.png')
  ])

  t.is(contexts.length, 2)
  t.not(contexts[0], contexts[1])
})

test('caches a refused ping for minutes and any other result for a day', async t => {
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

  const server = http.createServer((req, res) => {
    res.statusCode = Number(req.url.slice(1))
    res.end()
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.teardown(() => server.close())
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  const storedTtl = async url => {
    const { remote } = pingCache.store
    const raw = await remote.store.get(remote._getKeyPrefix(url))
    return JSON.parse(raw).expires - Date.now()
  }

  const expectations = [
    [200, ms('1d')],
    [404, ms('1d')],
    [403, ms('5m')],
    [408, ms('5m')],
    [429, ms('5m')],
    [503, ms('5m')]
  ]

  for (const [statusCode, ttl] of expectations) {
    const url = `${baseUrl}/${statusCode}`
    const response = await reachableUrl(url)
    t.is(response.statusCode, statusCode)
    const remaining = await storedTtl(url)
    t.true(
      remaining > ttl - ms('1m') && remaining <= ttl,
      `${statusCode}: ${remaining}ms`
    )
  }
})
