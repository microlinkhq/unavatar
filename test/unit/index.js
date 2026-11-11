'use strict'

const { default: test } = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const proxyquireIndex = stubs =>
  proxyquire('../../src/index', {
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
    './util/api-provider': () => ({ createApiProvider: sinon.stub() }),
    './providers': () => ({
      providers: {},
      providerTiers: {},
      providersBy: {}
    }),
    './avatar/auto': () => ({
      auto: sinon.stub().returns(() => {}),
      getInputType: sinon.stub(),
      getAvatar: sinon.stub()
    }),
    ...stubs
  })

test.serial(
  'supports explicit resolvers for email and domain while keeping direct input',
  async t => {
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

    const createUnavatar = proxyquireIndex({
      './providers': () => ({
        providers: { github: githubProvider },
        providerTiers: {
          email: [['gravatar']],
          domain: [['microlink']],
          username: []
        },
        providersBy: {
          email: ['gravatar'],
          domain: ['microlink'],
          username: []
        }
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

    t.deepEqual(resolversByType.email.getCall(0).args, [
      'hello@microlink.io',
      {}
    ])
    t.deepEqual(resolversByType.domain.getCall(0).args, ['facebook.com', {}])
    t.deepEqual(resolversByType.email.getCall(1).args, [
      'hello@example.com',
      {}
    ])

    t.true(getInputType.calledOnceWithExactly('hello@example.com'))
    t.true(
      getAvatar.calledOnceWithExactly(githubProvider, 'github', 'kikobeats', {})
    )
  }
)

const loadWithFetchHook = hooks => {
  const seen = {}
  const createUnavatar = proxyquireIndex({
    './util/html-provider': opts => {
      seen.html = opts.onFetch
      return {
        createHtmlProvider: sinon.stub(),
        getOgImage: sinon.stub(),
        NOT_FOUND: Symbol('NOT_FOUND')
      }
    },
    './util/api-provider': opts => {
      seen.api = opts.onFetch
      return { createApiProvider: sinon.stub() }
    }
  })

  createUnavatar(hooks)
  return seen
}

test.serial('onFetchHTML is forwarded when onFetch is omitted', t => {
  const onFetchHTML = () => {}
  const seen = loadWithFetchHook({ onFetchHTML })

  t.is(seen.html, onFetchHTML)
  t.is(seen.api, onFetchHTML)
})

test.serial('onFetch is forwarded to html and api providers', t => {
  const onFetch = () => {}
  const seen = loadWithFetchHook({ onFetch })

  t.is(seen.html, onFetch)
  t.is(seen.api, onFetch)
})

test.serial('onFetch wins when onFetchHTML is also passed', t => {
  const onFetch = () => {}
  const onFetchHTML = () => {}
  const seen = loadWithFetchHook({ onFetch, onFetchHTML })

  t.is(seen.html, onFetch)
  t.is(seen.api, onFetch)
})
