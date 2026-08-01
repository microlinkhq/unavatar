'use strict'

const { setTimeout } = require('node:timers/promises')
const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const autoFactory = require('../../../src/avatar/auto')

const createAuto = ({ isReservedIp = async () => false, ...options }) =>
  autoFactory({ ...options, isReservedIp })

test('getInputType classifies email input', t => {
  t.is(autoFactory.getInputType('hello@microlink.io'), 'email')
})

test('getInputType classifies sha256 hash input', t => {
  t.is(
    autoFactory.getInputType(
      '84059b07d4be67b806386c0aad8070a23f18836bbaae342275dc0a83414c32ee'
    ),
    'email'
  )
})

test('getInputType classifies md5 hash input', t => {
  t.is(autoFactory.getInputType('0bc83cb571cd1c50ba6f3e8a78ef1346'), 'email')
})

test('getInputType classifies domain input', t => {
  t.is(autoFactory.getInputType('reddit.com'), 'domain')
})

test('getInputType classifies localhost input as domain', t => {
  t.is(autoFactory.getInputType('localhost'), 'domain')
})

test('getInputType classifies username input', t => {
  t.is(autoFactory.getInputType('kikobeats'), 'username')
})

test('getInputType does not misclassify hex string shorter than md5 as hash', t => {
  // 31 hex chars — one under MD5 length, must remain username
  t.is(autoFactory.getInputType('deadbeef12345678deadbeef1234567'), 'username')
})

test('getInputType does not misclassify hex string longer than sha256 as hash', t => {
  // 65 hex chars — one over SHA256 length, must remain username
  t.is(autoFactory.getInputType('a'.repeat(65)), 'username')
})

test('auto(type) uses the provided input type resolver', async t => {
  const provider = sinon.stub().resolves('https://example.com/avatar.png')
  const reachableUrl = sinon.stub().resolves({
    statusCode: 200,
    url: 'https://example.com/avatar.png'
  })
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { auto } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const resolver = auto('domain')
  const result = await resolver('kikobeats')

  t.is(typeof resolver, 'function')
  t.true(provider.calledOnce)
  t.deepEqual(result, {
    type: 'url',
    data: 'https://example.com/avatar.png',
    provider: 'google'
  })
})

test('email hash input routes only to gravatar, not to other email providers', async t => {
  const gravatar = sinon.stub().resolves('https://gravatar.com/avatar/abc')
  const github = sinon.stub().resolves('https://github.com/user.png')
  const reachableUrl = sinon.stub().resolves({
    statusCode: 200,
    url: 'https://gravatar.com/avatar/abc'
  })
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { auto } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { gravatar, github },
    providerTiers: {
      email: [['gravatar', 'github']],
      emailHash: [['gravatar']]
    },
    reachableUrl
  })

  const md5hash = '0bc83cb571cd1c50ba6f3e8a78ef1346'
  await auto('email')(md5hash)

  t.true(gravatar.calledOnce)
  t.true(github.notCalled)
})

const createTiers = ({
  failing = [],
  hanging = [],
  slow = {},
  REQUEST_TIMEOUT = 25000
} = {}) => {
  const calls = []
  const provider = name => async () => {
    calls.push(name)
    if (slow[name]) await setTimeout(slow[name])
    if (hanging.includes(name)) return new Promise(() => {})
    if (failing.includes(name)) throw new Error(`${name} failed`)
    return `https://${name}`
  }
  const reachableUrl = async url => ({ statusCode: 200, url })
  reachableUrl.isReachable = () => true

  const { auto } = createAuto({
    constants: { REQUEST_TIMEOUT },
    providers: { primary: provider('primary'), fallback: provider('fallback') },
    providerTiers: { domain: [['primary'], ['fallback']] },
    reachableUrl
  })

  return { resolve: auto('domain'), calls }
}

test('a later tier only runs once the one before it is exhausted', async t => {
  const { resolve, calls } = createTiers({ failing: ['primary'] })

  const { data } = await resolve('example.com', {})

  t.is(data, 'https://fallback')
  t.deepEqual(calls, ['primary', 'fallback'])
})

test('a later tier never runs when the one before it answers', async t => {
  const { resolve, calls } = createTiers()

  const { data } = await resolve('example.com', {})

  t.is(data, 'https://primary')
  t.deepEqual(calls, ['primary'])
})

test('the error raised when every tier fails is the first one', async t => {
  const { resolve } = createTiers({ failing: ['primary', 'fallback'] })

  const error = await t.throwsAsync(resolve('example.com', {}))
  t.true([...error].some(({ message }) => message === 'primary failed'))
})

test('a later tier inherits what is left of the budget, not a fresh one', async t => {
  const REQUEST_TIMEOUT = 300
  const { resolve, calls } = createTiers({
    slow: { primary: 200 },
    failing: ['primary'],
    hanging: ['fallback'],
    REQUEST_TIMEOUT
  })

  const startedAt = Date.now()
  await t.throwsAsync(resolve('example.com', {}))
  const elapsed = Date.now() - startedAt

  t.deepEqual(calls, ['primary', 'fallback'])
  t.true(
    elapsed < REQUEST_TIMEOUT * 1.5,
    `a fallback given a fresh budget took ${elapsed}ms, past the ${REQUEST_TIMEOUT}ms deadline`
  )
})

test('a later tier is not started once the budget is gone', async t => {
  const REQUEST_TIMEOUT = 200
  const { resolve, calls } = createTiers({
    hanging: ['primary', 'fallback'],
    REQUEST_TIMEOUT
  })

  const startedAt = Date.now()
  await t.throwsAsync(resolve('example.com', {}))
  const elapsed = Date.now() - startedAt

  t.deepEqual(calls, ['primary'])
  t.true(
    elapsed < REQUEST_TIMEOUT * 2,
    `two hanging tiers took ${elapsed}ms, past the ${REQUEST_TIMEOUT}ms budget`
  )
})

test('a zero budget still raises a real error, never undefined', async t => {
  const { resolve, calls } = createTiers({
    hanging: ['primary', 'fallback'],
    REQUEST_TIMEOUT: 0
  })

  const error = await t.throwsAsync(resolve('example.com', {}))

  t.true(error instanceof Error)
  t.deepEqual(calls, ['primary'])
})

test('a provider reached with the budget already spent times out at once', async t => {
  const REQUEST_TIMEOUT = 25000
  const provider = () => new Promise(() => {})
  const reachableUrl = () => {}
  reachableUrl.isReachable = () => true

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT },
    providers: {},
    providerTiers: {},
    reachableUrl
  })

  const spent = Date.now() - 1000

  const startedAt = Date.now()
  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {}, spent)
  )
  const elapsed = Date.now() - startedAt

  t.is(error.name, 'TimeoutError')
  t.is(error.provider, 'google')
  t.true(
    elapsed < REQUEST_TIMEOUT / 10,
    `a spent budget waited ${elapsed}ms instead of rejecting at once`
  )
})

test('an input type with no providers declared reports not found', async t => {
  const reachableUrl = () => {}
  reachableUrl.isReachable = () => true

  const { auto } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: {},
    providerTiers: { email: [['gravatar']] },
    reachableUrl
  })

  const error = await t.throwsAsync(auto('email')('0'.repeat(32), {}))

  t.is(error.message, 'No providers declared for `emailHash`.')
  t.is(error.statusCode, 404)
})

test('getInputType is deterministic with stateful domain regex', t => {
  const autoFactoryWithStatefulRegex = proxyquire('../../../src/avatar/auto', {
    'url-regex-safe': () => /reddit\.com/g
  })

  t.is(autoFactoryWithStatefulRegex.getInputType('reddit.com'), 'domain')
  t.is(autoFactoryWithStatefulRegex.getInputType('reddit.com'), 'domain')
})

test('getAvatar throws "not found" when provider returns undefined', async t => {
  const provider = sinon.stub().resolves(undefined)
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {})
  )
  t.is(error.message, 'not found')
  t.is(error.statusCode, 404)
  t.is(error.provider, 'google')
})

test('getAvatar throws "invalid" when provider returns a non-string value', async t => {
  const provider = sinon.stub().resolves(null)
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {})
  )
  t.is(error.message, '`null` is invalid')
  t.is(error.statusCode, 422)
  t.is(error.provider, 'google')
})

test('getAvatar throws "invalid" when provider returns an empty string', async t => {
  const provider = sinon.stub().resolves('')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {})
  )
  t.is(error.message, '`` is invalid')
  t.is(error.statusCode, 422)
})

test('getAvatar throws when provider returns a non-absolute URL', async t => {
  const provider = sinon.stub().resolves('/path/to/avatar.png')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {})
  )
  t.is(error.message, 'The URL must to be absolute.')
  t.is(error.statusCode, 400)
  t.is(error.provider, 'google')
})

test('getAvatar throws when the resolved URL is not reachable', async t => {
  const provider = sinon.stub().resolves('https://example.com/avatar.png')
  const reachableUrl = sinon
    .stub()
    .resolves({ statusCode: 404, url: 'https://example.com/avatar.png' })
  reachableUrl.isReachable = sinon.stub().returns(false)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {})
  )
  t.is(error.statusCode, 404)
  t.is(error.provider, 'google')
})

test('getAvatar sets provider on error from response.statusCode when statusCode is missing', async t => {
  const providerError = Object.assign(new Error('upstream failure'), {
    response: { statusCode: 503 }
  })
  const provider = sinon.stub().rejects(providerError)
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'google', 'input', {})
  )
  t.is(error.statusCode, 503)
  t.is(error.provider, 'google')
})

test('auto(type) is deterministic with stateful data URI regex', async t => {
  const autoFactoryWithStatefulRegex = proxyquire('../../../src/avatar/auto', {
    'data-uri-regex': () => /^data:image\/.+/g
  })

  const provider = sinon.stub().resolves('data:image/png;base64,AAAA')
  const reachableUrl = sinon.stub().resolves({
    statusCode: 200,
    url: 'https://example.com/avatar.png'
  })
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { auto } = autoFactoryWithStatefulRegex({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providerTiers: { domain: [['google']] },
    reachableUrl,
    isReservedIp: async () => false
  })

  const resolver = auto('domain')

  t.deepEqual(await resolver('reddit.com'), {
    type: 'buffer',
    data: 'data:image/png;base64,AAAA'
  })
  t.deepEqual(await resolver('reddit.com'), {
    type: 'buffer',
    data: 'data:image/png;base64,AAAA'
  })
  t.true(reachableUrl.notCalled)
})

test('refuses an avatar hosted on a reserved address before fetching it', async t => {
  const provider = sinon.stub().resolves('https://127.0.0.1/avatar.png')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { bimi: provider },
    providerTiers: { domain: [['bimi']] },
    reachableUrl,
    isReservedIp: async hostname => hostname === '127.0.0.1'
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'bimi', 'attacker.com', {})
  )

  t.is(error.statusCode, 403)
  t.is(error.provider, 'bimi')
  t.is(error.message, 'The URL points to a reserved address.')
  t.true(reachableUrl.notCalled)
})

test('refuses an avatar that redirects onto a reserved address', async t => {
  const provider = sinon.stub().resolves('https://attacker.com/avatar.png')
  const reachableUrl = sinon.stub().resolves({
    statusCode: 200,
    url: 'https://169.254.169.254/avatar.png'
  })
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { bimi: provider },
    providerTiers: { domain: [['bimi']] },
    reachableUrl,
    isReservedIp: async hostname => hostname === '169.254.169.254'
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'bimi', 'attacker.com', {})
  )

  t.is(error.statusCode, 403)
  t.is(error.provider, 'bimi')
  t.true(reachableUrl.calledOnce)
})

test('refuses an avatar whose redirect was blocked before connecting', async t => {
  const provider = sinon.stub().resolves('https://attacker.com/avatar.png')
  const reachableUrl = sinon.stub().resolves({
    statusCode: 404,
    url: 'https://attacker.com/avatar.png',
    reservedAddress: '127.0.0.1'
  })
  reachableUrl.isReachable = sinon.stub().returns(false)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { bimi: provider },
    providerTiers: { domain: [['bimi']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'bimi', 'attacker.com', {})
  )

  t.is(error.statusCode, 403)
  t.is(error.provider, 'bimi')
  t.is(error.message, 'The URL points to a reserved address.')
})

test('a provider refused by got surfaces as forbidden, not as a fatal error', async t => {
  const refused = Object.assign(
    new Error('Refusing to request a reserved address: 127.0.0.1'),
    { code: 'ERESERVEDADDRESSRANGE' }
  )
  const provider = sinon.stub().rejects(refused)
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { mastodon: provider },
    providerTiers: { username: [['mastodon']] },
    reachableUrl
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'mastodon', 'user@attacker.com', {})
  )

  t.is(error.statusCode, 403)
  t.is(error.provider, 'mastodon')
  t.true(reachableUrl.notCalled)
})

test('refuses an IPv6 reserved address', async t => {
  const provider = sinon.stub().resolves('https://[::1]/avatar.png')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { bimi: provider },
    providerTiers: { domain: [['bimi']] },
    reachableUrl,
    isReservedIp: async hostname => hostname === '[::1]'
  })

  const error = await t.throwsAsync(() =>
    getAvatar(provider, 'bimi', 'attacker.com', {})
  )

  t.is(error.statusCode, 403)
  t.true(reachableUrl.notCalled)
})

test('a data URI avatar skips the reserved address check', async t => {
  const provider = sinon.stub().resolves('data:image/png;base64,AAAA')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)
  const isReservedIp = sinon.stub().resolves(true)

  const { getAvatar } = createAuto({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { gravatar: provider },
    providerTiers: { email: [['gravatar']] },
    reachableUrl,
    isReservedIp
  })

  t.deepEqual(await getAvatar(provider, 'gravatar', 'hello@microlink.io', {}), {
    type: 'buffer',
    data: 'data:image/png;base64,AAAA'
  })
  t.true(isReservedIp.notCalled)
})
