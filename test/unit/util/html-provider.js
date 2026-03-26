'use strict'

const sinon = require('sinon')
const test = require('ava')
const cheerio = require('cheerio')

const { NOT_FOUND } = require('../../../src/util/html-provider')

const createProvider = (opts = {}) => {
  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    onFetchHTML: undefined,
    getHTML:
      opts.getHTML ??
      (async () => ({ $: {}, statusCode: opts.responseStatusCode ?? 200 }))
  })

  return createHtmlProvider({
    name: 'test-provider',
    url: () => opts.providerUrl ?? 'https://www.openstreetmap.org/user/Terence',
    getter: () => opts.getterResult,
    isBlocked: opts.isBlocked,
    htmlOpts: opts.htmlOpts
  })
}

const runProvider = (provider, args = {}) =>
  provider({
    input: args.input ?? 'test',
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

  await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })
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

test('createHtmlProvider returns undefined when status is 404 and no onFetchHTML', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    responseStatusCode: 404
  })

  const result = await runProvider(provider)

  t.is(result, undefined)
})

test('attempt returns NOT_FOUND symbol when status is 404 via onFetchHTML', async t => {
  const { NOT_FOUND } = require('../../../src/util/html-provider')

  const onFetchHTML = async ({ attempt }) => attempt()

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: 404 }),
    onFetchHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => '/assets/avatar.svg'
  })

  const result = await runProvider(provider)

  t.is(result, NOT_FOUND)
})

test('createHtmlProvider throws when status code is undefined', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    getHTML: async () => ({ $: {}, statusCode: undefined })
  })

  await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
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

  const onFetchHTML = async ({ attempt }) => {
    await attempt({ gotOpts: { customOption: true }, tier: 'datacenter' })
    return 'https://resolved.example/avatar.png'
  }

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML,
    onFetchHTML
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

test('createHtmlProvider delegates to onFetchHTML when provided', async t => {
  const getHTML = sinon.stub().resolves({ $: {}, statusCode: 200 })
  const onFetchHTML = sinon
    .stub()
    .resolves('https://hook-returned.example/avatar.png')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML,
    onFetchHTML
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
  t.true(onFetchHTML.calledOnce)
  const hookArg = onFetchHTML.firstCall.args[0]
  t.is(hookArg.provider, 'test-provider')
  t.is(hookArg.providerUrl, 'https://example.com/user')
  t.is(typeof hookArg.attempt, 'function')
})

test('createHtmlProvider passes req and res to onFetchHTML', async t => {
  const req = { query: { proxy: true } }
  const res = { setHeader: sinon.stub() }
  const onFetchHTML = sinon.stub().resolves('https://hook.example/img.png')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $: {}, statusCode: 200 }),
    onFetchHTML
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://example.com/user',
    getter: () => 'https://cdn.example.com/avatar.png'
  })

  await runProvider(provider, { req, res })

  t.true(onFetchHTML.calledOnce)
  const hookArg = onFetchHTML.firstCall.args[0]
  t.is(hookArg.req, req)
  t.is(hookArg.res, res)
})

test('createHtmlProvider attaches html to error when getter returns empty', async t => {
  const $ = cheerio.load('<html><body><h1>Blocked</h1></body></html>')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.reddit.com/user/kikobeats/',
    getter: () => undefined
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.is(typeof error.html, 'string')
  t.true(error.html.includes('<h1>Blocked</h1>'))
})

test('createHtmlProvider sets blocked and attaches html on error when isBlocked returns true', async t => {
  const $ = cheerio.load('<html><title>Login • Instagram</title></html>')

  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML: async () => ({ $, statusCode: 200 })
  })

  const provider = createHtmlProvider({
    name: 'test-provider',
    url: () => 'https://www.instagram.com/willsmith',
    getter: () => undefined,
    isBlocked: $ => $('title').text().includes('Login')
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.true(error.blocked)
  t.is(typeof error.html, 'string')
  t.true(error.html.includes('Login'))
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

test('createHtmlProvider sets blocked when isBlocked returns true', async t => {
  const provider = createProvider({
    getterResult: undefined,
    isBlocked: () => true
  })

  const error = await t.throwsAsync(runProvider(provider), {
    message: 'Empty value returned by the provider.'
  })

  t.true(error.blocked)
})

test('createHtmlProvider sets blocked via is-antibot when HTML contains antibot signals', async t => {
  const html =
    '<html><head><title>Blocked</title></head><body><div class="cf-turnstile"></div></body></html>'
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

test('module exports NOT_FOUND symbol', t => {
  t.is(typeof NOT_FOUND, 'symbol')
  t.is(NOT_FOUND.toString(), 'Symbol(NOT_FOUND)')
})
