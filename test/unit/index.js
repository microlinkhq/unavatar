'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

test('supports explicit resolvers for email and domain while keeping direct input', async t => {
  const githubProvider = sinon.stub()
  const getInputType = sinon.stub().returns('email')
  const getAvatar = sinon.stub().resolves({
    type: 'url',
    data: 'https://example.com/github.png',
    provider: 'github'
  })

  const resolversByType = {
    email: sinon.stub().resolves({
      type: 'url',
      data: 'https://example.com/email.png',
      provider: 'gravatar'
    }),
    domain: sinon.stub().resolves({
      type: 'url',
      data: 'https://example.com/domain.png',
      provider: 'microlink'
    })
  }

  const auto = sinon.stub().callsFake(inputType => resolversByType[inputType])

  const createUnavatar = proxyquire('../../src/index', {
    './constant': {},
    './util/keyv': () => ({
      createMultiCache: sinon.stub(),
      createRedisCache: sinon.stub()
    }),
    './util/cache': () => ({
      dnsCache: {},
      pingCache: {},
      githubSearchCache: {},
      itunesSearchCache: {}
    }),
    './util/cacheable-lookup': () => ({}),
    './util/is-reserved-ip': () => ({}),
    './util/got': () => ({}),
    './util/reachable-url': () => ({}),
    './util/browserless': () => () => ({}),
    './util/html-get': () => () => ({}),
    './util/html-provider': () => ({
      createHtmlProvider: sinon.stub(),
      getOgImage: sinon.stub(),
      NOT_FOUND: Symbol('NOT_FOUND')
    }),
    './providers': () => ({
      providers: { github: githubProvider },
      providersBy: { email: ['gravatar'], domain: ['microlink'], username: [] }
    }),
    './avatar/auto': () => ({ auto, getInputType, getAvatar })
  })

  const unavatar = createUnavatar()

  t.is(typeof unavatar.email, 'function')
  t.is(typeof unavatar.domain, 'function')

  await unavatar.email('hello@microlink.io')
  await unavatar.domain('facebook.com')
  await unavatar('hello@example.com')
  await unavatar.github('kikobeats')

  t.is(auto.callCount, 3)
  t.deepEqual(auto.getCall(0).args, ['email'])
  t.deepEqual(auto.getCall(1).args, ['domain'])
  t.deepEqual(auto.getCall(2).args, ['email'])

  t.deepEqual(resolversByType.email.getCall(0).args, ['hello@microlink.io', {}])
  t.deepEqual(resolversByType.domain.getCall(0).args, ['facebook.com', {}])
  t.deepEqual(resolversByType.email.getCall(1).args, ['hello@example.com', {}])

  t.true(getInputType.calledOnceWithExactly('hello@example.com'))
  t.true(getAvatar.calledOnceWithExactly(githubProvider, 'github', 'kikobeats', {}))
})
