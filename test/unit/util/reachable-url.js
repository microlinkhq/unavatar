'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

test('reachable-url composes ping-url with cache and merged got options', async t => {
  const ping = sinon.stub().resolves({ statusCode: 200, url: 'https://example.com' })
  const pingCache = { name: 'ping-cache' }

  const createPingUrl = sinon.stub().callsFake((cache, opts) => {
    t.deepEqual(cache, pingCache)
    t.is(typeof opts.value, 'function')
    t.deepEqual(opts.value({ url: 'https://example.com', statusCode: 200, ignored: true }), {
      url: 'https://example.com',
      statusCode: 200
    })
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

  const value = await reachableUrl('https://example.com/avatar.png', { retry: { limit: 1 } })

  t.deepEqual(value, { statusCode: 200, url: 'https://example.com' })
  t.true(
    ping.calledOnceWithExactly('https://example.com/avatar.png', {
      timeout: 1234,
      retry: { limit: 1 }
    })
  )
  t.true(reachableUrl.isReachable())
})
