'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const buildGot = ({ isReservedIp = async () => false } = {}) => {
  const uaHints = sinon.stub().callsFake(userAgent => ({ 'sec-ch-ua': `"${userAgent}"` }))
  const randomUserAgent = sinon.stub().returns('custom-agent')
  const uniqueRandomArray = sinon.stub().returns(randomUserAgent)
  const tlsHook = sinon.stub()
  const gotExtend = sinon.stub().returns({ name: 'got-instance' })
  const createIsReservedIp = sinon.stub().returns(isReservedIp)

  const gotFactory = proxyquire('../../../src/util/got', {
    'ua-hints': uaHints,
    'top-user-agents': ['agent-a', 'agent-b'],
    'unique-random-array': uniqueRandomArray,
    'https-tls/hook': tlsHook,
    './is-reserved-ip': createIsReservedIp,
    got: { extend: gotExtend }
  })

  const cacheableLookup = 'dns-cache'
  const got = gotFactory({ cacheableLookup })

  return {
    got,
    gotExtend,
    uaHints,
    randomUserAgent,
    uniqueRandomArray,
    tlsHook,
    createIsReservedIp,
    cacheableLookup
  }
}

test('got util creates instance with dns cache and hooks', t => {
  const { got, gotExtend, uniqueRandomArray, tlsHook, uaHints, createIsReservedIp, cacheableLookup } =
    buildGot()
  const gotOpts = gotExtend.firstCall.args[0]

  t.true(uniqueRandomArray.calledOnce)
  t.deepEqual(uaHints.args, [['agent-a'], ['agent-b']])
  t.true(gotExtend.calledOnceWithExactly(gotOpts))
  t.true(createIsReservedIp.calledOnceWithExactly({ cacheableLookup }))
  t.is(gotOpts.dnsCache, 'dns-cache')
  t.deepEqual(gotOpts.https, { rejectUnauthorized: false })
  t.true(Array.isArray(gotOpts.hooks.beforeRequest))
  t.is(gotOpts.hooks.beforeRequest.length, 3)
  t.is(gotOpts.hooks.beforeRequest[1], tlsHook)
  t.is(gotOpts.hooks.beforeRedirect.length, 1)
  t.is(got.gotOpts, gotOpts)
})

test('got util refuses reserved addresses on request and redirect', async t => {
  const isReservedIp = sinon.stub().callsFake(async hostname => hostname === '127.0.0.1')
  const { got } = buildGot({ isReservedIp })
  const deny = got.gotOpts.hooks.beforeRequest[2]

  await t.throwsAsync(deny({ url: { hostname: '127.0.0.1' } }), {
    message: 'Refusing request to reserved address: 127.0.0.1'
  })
  await t.notThrowsAsync(deny({ url: { hostname: 'cdn.microlink.io' } }))
  t.is(got.gotOpts.hooks.beforeRedirect[0], deny)
})

test('got util uses precomputed ua hints for top user agents', t => {
  const { got, uaHints } = buildGot()
  const userAgentHook = got.gotOpts.hooks.beforeRequest[0]

  uaHints.resetHistory()

  const optionsA = { headers: { 'user-agent': 'agent-a' } }
  const optionsB = { headers: { 'user-agent': 'agent-a' } }

  userAgentHook(optionsA)
  userAgentHook(optionsB)

  t.false(uaHints.called)
  t.is(optionsA.headers['sec-ch-ua'], '"agent-a"')
  t.is(optionsB.headers['sec-ch-ua'], '"agent-a"')
})

test('got util computes ua hints for non-top user agents per request', t => {
  const { got, uaHints } = buildGot()
  const userAgentHook = got.gotOpts.hooks.beforeRequest[0]

  uaHints.resetHistory()

  userAgentHook({ headers: { 'user-agent': 'Mozilla/5.0' } })
  userAgentHook({ headers: { 'user-agent': 'Mozilla/5.0' } })

  t.deepEqual(uaHints.args, [['Mozilla/5.0'], ['Mozilla/5.0']])
})

test('got util replaces default got user agent before computing hints', t => {
  const { got, uaHints, randomUserAgent } = buildGot()
  const userAgentHook = got.gotOpts.hooks.beforeRequest[0]
  const options = { headers: { 'user-agent': 'got (https://github.com/sindresorhus/got)' } }

  uaHints.resetHistory()
  userAgentHook(options)

  t.true(randomUserAgent.calledOnce)
  t.true(uaHints.calledOnceWithExactly('custom-agent'))
  t.is(options.headers['user-agent'], 'custom-agent')
  t.is(options.headers['sec-ch-ua'], '"custom-agent"')
})
