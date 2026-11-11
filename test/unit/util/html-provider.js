'use strict'

const sinon = require('sinon')
const { default: test } = require('ava')
const cheerio = require('cheerio')

const { NOT_FOUND } = require('../../../src/util/html-provider')

const createProvider = (opts = {}) => {
  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    onFetch: undefined,
    getHTML:
      opts.getHTML ??
      (async () => ({ $: {}, statusCode: opts.responseStatusCode ?? 200 }))
  })

  return createHtmlProvider({
    name: 'test-provider',
    url: () => opts.providerUrl ?? 'https://www.openstreetmap.org/user/Terence',
    getter: opts.getter ?? (() => opts.getterResult),
    htmlOpts: opts.htmlOpts
  })
}

const runProvider = (provider, args = {}) =>
  provider(args.input ?? 'test', {
    req: args.req ?? { query: {} },
    res: args.res ?? { setHeader: () => {} }
  })

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

test('createHtmlProvider throws when getter output is empty', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: undefined
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
  t.is(error.code, 'empty_getter_result')
})

test('createHtmlProvider throws when getter output is empty string', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: ''
  })

  await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
})

test('createHtmlProvider throws when upstream status is 500 and getter is empty', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: undefined,
    responseStatusCode: 500
  })

  await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
})

test('createHtmlProvider returns undefined when status is 404 and no onFetch', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    responseStatusCode: 404
  })

  const result = await runProvider(provider)

  t.is(result, undefined)
})

test('createHtmlProvider returns avatar URL when getter succeeds', async t => {
  const provider = createProvider({
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  const result = await runProvider(provider)

  t.is(result, 'https://cdn.example.com/avatar.png')
})

test('createHtmlProvider returns undefined when getter returns NOT_FOUND', async t => {
  const provider = createProvider({
    getter: () => NOT_FOUND
  })

  const result = await runProvider(provider)

  t.is(result, undefined)
})

test('createHtmlProvider prioritizes antibot detection over NOT_FOUND getter output', async t => {
  const $ = cheerio.load(
    '<html><head><title>Just a moment...</title></head><body><div class="cf-turnstile"></div></body></html>'
  )

  const provider = createProvider({
    getHTML: async () => ({ $, statusCode: 200 }),
    getter: () => NOT_FOUND
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.true(error.blocked)
})

test('a 404 through onFetch resolves to undefined, not the NOT_FOUND symbol', async t => {
  const onFetch = async ({ attempt }) => attempt()

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: 404 }),
    onFetch
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => '/assets/avatar.svg'
  })

  t.is(await runProvider(provider), undefined)
})

test('a provider miss through onFetch reaches auto as a plain not found', async t => {
  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: 404 }),
    onFetch: async ({ attempt }) => attempt()
  })
  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://example.com/user',
    getter: () => undefined
  })
  const auto = require('../../../src/avatar/auto')({
    constants: { REQUEST_TIMEOUT: 5000 },
    providers: {},
    providerTiers: {},
    reachableUrl: async () => ({}),
    isReservedIp: async () => false
  })

  const error = await t.throwsAsync(
    auto.getAvatar(provider, 'test-provider', 'test', {
      req: { query: {} },
      res: {}
    })
  )
  t.is(error.message, 'not found')
  t.is(error.statusCode, 404)
})

test('createHtmlProvider throws when status code is undefined', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    getHTML: async () => ({ $: {}, statusCode: undefined })
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
  t.is(error.code, 'missing_status_code')
  t.deepEqual(error.cause, {
    html: undefined,
    headers: {},
    statusCode: undefined
  })
})

test('createHtmlProvider throws when status code is null', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    getHTML: async () => ({ $: {}, statusCode: null })
  })

  await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
})

test('createHtmlProvider throws when status code is empty string', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    getHTML: async () => ({ $: {}, statusCode: '' })
  })

  await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
})

test('createHtmlProvider exposes getUrl on provider function', async t => {
  const urlFn = () => 'https://example.com/profile'
  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: urlFn,
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  t.is(provider.getUrl, urlFn)
})

test('createHtmlProvider forwards gotOpts to getHTML when attempt is called with gotOpts', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 200 })

  const onFetch = async ({ attempt }) => {
    await attempt({ gotOpts: { customOption: true }, tier: 'datacenter' })
    return 'https://resolved.example/avatar.png'
  }

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML,
    onFetch
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://example.com/user',
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  await runProvider(provider)

  t.true(getHTML.calledOnce)
  const callOpts = getHTML.firstCall.args[1]
  t.is(callOpts.tier, 'datacenter')
  t.true(callOpts.gotOpts?.customOption === true)
})

test('createHtmlProvider exposes response headers and status code via attempt', async t => {
  const responseHeaders = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'private, no-cache'
  }
  const responseStatusCode = 206

  const onFetch = async ({ attempt }) => {
    await attempt()
    return {
      headers: attempt.lastHeaders,
      statusCode: attempt.lastStatusCode
    }
  }

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({
      $: {},
      statusCode: responseStatusCode,
      headers: responseHeaders
    }),
    onFetch
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://example.com/user',
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  const result = await runProvider(provider)
  t.deepEqual(result.headers, responseHeaders)
  t.is(result.statusCode, responseStatusCode)
})

test('createHtmlProvider delegates to onFetch when provided', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 200 })
  const onFetch = sinon
    .stub()
    .resolves('https://hook-returned.example/avatar.png')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML,
    onFetch
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://example.com/user',
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  const result = await runProvider(provider, {
    req: { query: {} },
    res: { setHeader: () => {} }
  })

  t.is(result, 'https://hook-returned.example/avatar.png')
  t.true(onFetch.calledOnce)
  const hookArg = onFetch.firstCall.args[0]
  t.is(hookArg.provider, 'test-provider')
  t.is(hookArg.providerUrl, 'https://example.com/user')
  t.is(hookArg.kind, 'html')
  t.is(typeof hookArg.attempt, 'function')
})

test('createHtmlProvider passes req and res to onFetch', async t => {
  const req = { query: { proxy: true } }
  const res = { setHeader: sinon.stub() }
  const onFetch = sinon.stub().resolves('https://hook.example/img.png')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: 200 }),
    onFetch
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://example.com/user',
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  await runProvider(provider, { req, res })

  t.true(onFetch.calledOnce)
  const hookArg = onFetch.firstCall.args[0]
  t.is(hookArg.req, req)
  t.is(hookArg.res, res)
})

test('createHtmlProvider attaches html to error when getter returns empty', async t => {
  const $ = cheerio.load('<html><body><h1>Blocked</h1></body></html>')
  const responseHeaders = {
    server: 'instagram',
    'content-type': 'text/html; charset=utf-8'
  }

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $, statusCode: 200, headers: responseHeaders })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => undefined
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.is(typeof error.cause?.html, 'string')
  t.true(error.cause?.html.includes('<h1>Blocked</h1>'))
  t.deepEqual(error.cause?.headers, responseHeaders)
  t.is(error.cause?.statusCode, 200)
})

test('createHtmlProvider does not set blocked when getter returns undefined', async t => {
  const $ = cheerio.load('<html><body></body></html>')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.instagram.com/willsmith',
    getter: () => undefined
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.is(error.blocked, undefined)
})

test('createHtmlProvider sets blocked via is-antibot when HTML contains antibot signals', async t => {
  const html =
    '<html><head><title>Just a moment...</title></head><body><div class="cf-turnstile"></div></body></html>'
  const $ = cheerio.load(html)

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://ko-fi.com/someone',
    getter: () => undefined
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.true(error.blocked)
})

test('createHtmlProvider sets blocked when status code is 429', async t => {
  const $ = cheerio.load(
    '<html><head><title>kikobeats</title></head><body></body></html>'
  )

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $, statusCode: 429 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.instagram.com/kikobeats',
    getter: () => undefined
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.true(error.blocked)
  t.is(error.cause?.statusCode, 429)
})

test('module exports NOT_FOUND symbol', t => {
  t.is(typeof NOT_FOUND, 'symbol')
  t.is(NOT_FOUND.toString(), 'Symbol(NOT_FOUND)')
})
