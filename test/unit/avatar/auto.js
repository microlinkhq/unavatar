'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const autoFactory = require('../../../src/avatar/auto')

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

  const { auto } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'], email: [], username: [] },
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

  const { auto } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { gravatar, github },
    providersBy: { email: ['gravatar', 'github'], username: [], domain: [] },
    reachableUrl
  })

  const md5hash = '0bc83cb571cd1c50ba6f3e8a78ef1346'
  await auto('email')(md5hash)

  t.true(gravatar.calledOnce)
  t.true(github.notCalled)
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

  const { getAvatar } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'] },
    reachableUrl
  })

  const error = await t.throwsAsync(() => getAvatar(provider, 'google', 'input', {}))
  t.is(error.message, 'not found')
  t.is(error.statusCode, 404)
  t.is(error.provider, 'google')
})

test('getAvatar throws "invalid" when provider returns a non-string value', async t => {
  const provider = sinon.stub().resolves(null)
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'] },
    reachableUrl
  })

  const error = await t.throwsAsync(() => getAvatar(provider, 'google', 'input', {}))
  t.is(error.message, '`null` is invalid')
  t.is(error.statusCode, 422)
  t.is(error.provider, 'google')
})

test('getAvatar throws "invalid" when provider returns an empty string', async t => {
  const provider = sinon.stub().resolves('')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'] },
    reachableUrl
  })

  const error = await t.throwsAsync(() => getAvatar(provider, 'google', 'input', {}))
  t.is(error.message, '`` is invalid')
  t.is(error.statusCode, 422)
})

test('getAvatar throws when provider returns a non-absolute URL', async t => {
  const provider = sinon.stub().resolves('/path/to/avatar.png')
  const reachableUrl = sinon.stub()
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { getAvatar } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'] },
    reachableUrl
  })

  const error = await t.throwsAsync(() => getAvatar(provider, 'google', 'input', {}))
  t.is(error.message, 'The URL must to be absolute.')
  t.is(error.statusCode, 400)
  t.is(error.provider, 'google')
})

test('getAvatar throws when the resolved URL is not reachable', async t => {
  const provider = sinon.stub().resolves('https://example.com/avatar.png')
  const reachableUrl = sinon.stub().resolves({ statusCode: 404, url: 'https://example.com/avatar.png' })
  reachableUrl.isReachable = sinon.stub().returns(false)

  const { getAvatar } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'] },
    reachableUrl
  })

  const error = await t.throwsAsync(() => getAvatar(provider, 'google', 'input', {}))
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

  const { getAvatar } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'] },
    reachableUrl
  })

  const error = await t.throwsAsync(() => getAvatar(provider, 'google', 'input', {}))
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
    providersBy: { domain: ['google'], email: [], username: [] },
    reachableUrl
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
