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
  const server = http.createServer((req, res) => {
    res.statusCode = statusByPath.get(req.url) ?? Number(req.url.slice(1))
    res.end()
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.teardown(() => server.close())
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  const isCached = async url => {
    const { remote } = pingCache.store
    return (await remote.store.get(remote._getKeyPrefix(url))) !== undefined
  }

  return { reachableUrl, baseUrl, isCached, statusByPath }
}

test('caches pings except refusals', async t => {
  const { reachableUrl, baseUrl, isCached } = await createRealPing(t)

  const expectations = [
    [200, true],
    [404, true],
    [403, false],
    [408, false],
    [429, false],
    [503, false]
  ]

  for (const [statusCode, cached] of expectations) {
    const url = `${baseUrl}/${statusCode}`
    const response = await reachableUrl(url)
    t.deepEqual(response, { url, statusCode })
    t.is(await isCached(url), cached, String(statusCode))
  }
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
