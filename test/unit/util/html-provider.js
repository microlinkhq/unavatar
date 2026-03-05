'use strict'

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const test = require('ava')
const cheerio = require('cheerio')
const { REQUEST_TIMEOUT } = require('../../../src/constant')

const createProPlanError = () => {
  const error = new Error('This provider requires a pro plan.')
  error.cause = { statusCode: 403, code: 'EPRO', message: error.message }
  return error
}

const createProvider = ({ providerUrl, getterResult, responseStatusCode = 200 }) => {
  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: responseStatusCode })
  })

  return createHtmlProvider({
    name: 'test-provider',
    url: () => providerUrl,
    getter: () => getterResult
  })
}

const runProvider = (provider, { req, opts, res } = {}) =>
  provider(
    {
      input: 'test',
      opts: opts || (async () => ({})),
      req: req || { query: {}, customerId: undefined },
      res: res || { setHeader: () => {} }
    },
    () => {}
  )

test('createHtmlProvider normalizes relative getter output to absolute URL', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.openstreetmap.org/user/Terence',
    getterResult: '/assets/avatar.svg'
  })

  const result = await runProvider(provider)

  t.is(result, 'https://www.openstreetmap.org/assets/avatar.svg')
})

test('createHtmlProvider keeps absolute getter output unchanged', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.openstreetmap.org/user/Terence',
    getterResult: 'https://www.gravatar.com/avatar/hash.jpg?s=100'
  })

  const result = await runProvider(provider)

  t.is(result, 'https://www.gravatar.com/avatar/hash.jpg?s=100')
})

test('createHtmlProvider returns undefined when getter output is empty on all tiers', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: undefined
  })

  const result = await runProvider(provider)
  t.is(result, undefined)
})

test('createHtmlProvider returns undefined when upstream status is invalid across tiers', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: undefined,
    responseStatusCode: 500
  })

  const result = await runProvider(provider)
  t.is(result, undefined)
})

test('createHtmlProvider retries proxy tiers when getter output is empty', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 200 })
  const opts = sinon.stub().resolves({})

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => undefined
  })

  const result = await provider(
    {
      input: 'test',
      opts,
      req: { query: {}, customerId: undefined },
      res: { setHeader: () => {} }
    },
    () => {}
  )

  t.is(result, undefined)
  t.true(getHTML.calledThrice)
  t.true(opts.calledTwice)
})

test('createHtmlProvider returns undefined for empty string getter output after proxy retries', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 200 })
  const opts = sinon.stub().resolves({})

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => ''
  })

  const result = await provider(
    {
      input: 'test',
      opts,
      req: { query: {}, customerId: undefined },
      res: { setHeader: () => {} }
    },
    () => {}
  )

  t.is(result, undefined)
  t.true(getHTML.calledThrice)
  t.true(opts.calledTwice)
})

test('createHtmlProvider retries with proxy when origin status code is empty', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    responseStatusCode: null
  })

  const result = await runProvider(provider)
  t.is(result, 'https://www.reddit.com/assets/avatar.svg')
})

test('createHtmlProvider retries with proxy when origin status code is empty string', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    responseStatusCode: ''
  })

  const result = await runProvider(provider)
  t.is(result, 'https://www.reddit.com/assets/avatar.svg')
})

test('createHtmlProvider skips proxy tiers when origin returns not found', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 404 })
  const opts = sinon.stub().resolves({})

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => '/assets/avatar.svg'
  })

  const result = await provider(
    {
      input: 'test',
      opts,
      req: { query: {}, customerId: undefined },
      res: { setHeader: () => {} }
    },
    () => {}
  )

  t.is(result, undefined)
  t.true(getHTML.calledOnce)
  t.false(opts.called)
})

test('createHtmlProvider retries proxy tiers for pro requests when origin is blocked', async t => {
  const getHTML = sinon.stub()
  const opts = sinon.stub().resolves({})
  const setHeader = sinon.stub()
  const getter = sinon.stub()

  getHTML.onFirstCall().resolves({ $: {}, statusCode: 403 })
  getHTML.onSecondCall().resolves({ $: {}, statusCode: 200 })

  getter.onFirstCall().returns(undefined)
  getter.onSecondCall().returns('/assets/avatar.svg')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter
  })

  const result = await runProvider(provider, {
    req: { query: {}, customerId: undefined, isPro: true },
    opts,
    res: { setHeader }
  })

  t.is(result, 'https://www.reddit.com/assets/avatar.svg')
  t.true(getHTML.calledTwice)
  t.true(opts.calledOnce)
  t.true(setHeader.calledWith('x-proxy-tier', 'datacenter'))
})

test('createHtmlProvider enforces bounded timeout per tier', async t => {
  const getHTML = sinon.stub()
  const expectedTimeout = Math.floor(REQUEST_TIMEOUT / 3)
  const opts = sinon.stub().resolves({
    gotOpts: { timeout: expectedTimeout }
  })
  const getter = sinon.stub()

  getHTML.onFirstCall().resolves({ $: {}, statusCode: 403 })
  getHTML.onSecondCall().resolves({ $: {}, statusCode: 200 })

  getter.onFirstCall().returns(undefined)
  getter.onSecondCall().returns('/assets/avatar.svg')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: expectedTimeout,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter
  })

  const result = await runProvider(provider, {
    req: { query: {}, customerId: undefined, isPro: true },
    opts
  })

  t.is(result, 'https://www.reddit.com/assets/avatar.svg')
  t.true(getHTML.getCalls().some(call => call.args[1]?.gotOpts?.timeout === expectedTimeout))
  t.deepEqual(opts.firstCall.args[1], {
    superProxy: false,
    timeout: expectedTimeout
  })
})

test('createHtmlProvider returns undefined when proxy opts rejects', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 403 })
  const opts = sinon.stub().rejects(createProPlanError())
  const getter = sinon.stub().returns(undefined)

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter
  })

  const result = await runProvider(provider, {
    req: { query: {}, customerId: undefined, isPro: false },
    opts
  })

  t.is(result, undefined)
})

test('createHtmlProvider uses residential proxy when datacenter proxy fails', async t => {
  const getHTML = sinon.stub()
  const opts = sinon.stub().resolves({})
  const setHeader = sinon.stub()
  const getter = sinon.stub()

  getHTML.onFirstCall().resolves({ $: {}, statusCode: 403 })
  getHTML.onSecondCall().resolves({ $: {}, statusCode: 200 })
  getHTML.onThirdCall().resolves({ $: {}, statusCode: 200 })

  getter.onCall(0).returns(undefined)
  getter.onCall(1).returns(undefined)
  getter.onCall(2).returns('/assets/avatar.svg')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter
  })

  const result = await runProvider(provider, {
    req: { query: {}, customerId: undefined, isPro: true },
    opts,
    res: { setHeader }
  })

  t.is(result, 'https://www.reddit.com/assets/avatar.svg')
  t.true(getHTML.calledThrice)
  t.true(opts.calledTwice)
  t.true(setHeader.calledWith('x-proxy-tier', 'residential'))
})

test('createHtmlProvider retries residential when datacenter returns 429', async t => {
  const getHTML = sinon.stub()
  const opts = sinon.stub().resolves({})
  const setHeader = sinon.stub()
  const getter = sinon.stub()

  getHTML.onFirstCall().resolves({ $: {}, statusCode: 200 })
  getHTML.onSecondCall().resolves({ $: {}, statusCode: 429 })
  getHTML.onThirdCall().resolves({ $: {}, statusCode: 200 })

  getter.onCall(0).returns(undefined)
  getter.onCall(1).returns(undefined)
  getter.onCall(2).returns('/assets/avatar.svg')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter
  })

  const result = await runProvider(provider, {
    req: { query: {}, customerId: undefined, isPro: true },
    opts,
    res: { setHeader }
  })

  t.is(result, 'https://www.reddit.com/assets/avatar.svg')
  t.true(getHTML.calledThrice)
  t.true(opts.calledTwice)
  t.true(setHeader.calledWith('x-proxy-tier', 'residential'))
})

test('createHtmlProvider logs html debug info when result is empty', async t => {
  const debugError = sinon.stub()
  const debugLog = sinon.stub()
  const debug = Object.assign(debugLog, {
    error: debugError,
    duration: (...baseArgs) => {
      const durationLog = (...args) => debugLog(...baseArgs, ...args)
      durationLog.error = (...args) => debugError(...baseArgs, ...args)
      durationLog.info = (...args) => debugLog(...baseArgs, ...args)
      return durationLog
    }
  })
  const $ = cheerio.load(
    '<html><head><title>Test Profile</title><meta property="og:image" content="https://cdn.example.com/avatar.png" /></head><body><h1>Blocked</h1></body></html>'
  )

  const { createHtmlProvider } = proxyquire('../../../src/util/html-provider', {
    'debug-logfmt': () => debug
  })({
    PROXY_TIMEOUT: 8000,
    getHTML: sinon.stub().resolves({ $, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => undefined
  })

  await runProvider(provider)

  t.true(
    debugError.calledWithMatch(
      sinon.match({
        tier: 'origin',
        provider: 'test-provider'
      }),
      sinon.match(
        value => value.status === undefined && value.statusCode === 200 && value.htmlLength > 0
      )
    )
  )
})

test('createHtmlProvider writes full html into provider-tier file when enabled', async t => {
  const mkdir = sinon.stub().resolves()
  const writeFile = sinon.stub().resolves()
  const opts = sinon.stub().rejects(createProPlanError())
  const $ = cheerio.load('<html><body><h1>Full HTML</h1></body></html>')

  const proxyquireNoCache = proxyquire.noPreserveCache()
  const { createHtmlProvider } = proxyquireNoCache('../../../src/util/html-provider', {
    'fs/promises': { mkdir, writeFile }
  })({
    PROXY_TIMEOUT: 8000,
    DEBUG_HTML_TO_FILE: true,
    getHTML: sinon.stub().resolves({ $, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'substack',
    url: () => 'https://failingwithdata.substack.com',
    getter: () => undefined
  })

  await runProvider(provider, { opts })

  t.true(mkdir.called)
  t.true(writeFile.calledOnce)
  t.regex(writeFile.firstCall.args[0], /\/tmp\/html\/substack-origin-[a-z0-9._-]+\.html$/)
  t.true(writeFile.firstCall.args[1].includes('<h1>Full HTML</h1>'))
})
