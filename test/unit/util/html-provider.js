'use strict'

const sinon = require('sinon')
const test = require('ava')
const cheerio = require('cheerio')

const { NOT_FOUND } = require('../../../src/util/html-provider')

const createProvider = (opts = {}) => {
  const { createHtmlProvider } = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    onFetchHTML: undefined,
    getHTML: opts.getHTML ?? (async () => ({ $: {}, statusCode: opts.responseStatusCode ?? 200 }))
  })

  return createHtmlProvider({
    name: 'test-provider',
    url: () => opts.providerUrl ?? 'https://www.openstreetmap.org/user/Terence',
    getter: () => opts.getterResult,
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

test('createHtmlProvider returns NOT_FOUND when status is 404', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    responseStatusCode: 404
  })

  const result = await runProvider(provider)

  t.is(result, NOT_FOUND)
})

test('createHtmlProvider throws when status code is missing', async t => {
  const provider = createProvider({
    providerUrl: 'https://www.reddit.com/user/kikobeats/',
    getterResult: '/assets/avatar.svg',
    getHTML: async () => ({ $: {}, statusCode: undefined })
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
  const onFetchHTML = sinon.stub().resolves('https://hook-returned.example/avatar.png')

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

test('module exports NOT_FOUND symbol', t => {
  t.is(typeof NOT_FOUND, 'symbol')
  t.is(NOT_FOUND.toString(), 'Symbol(NOT_FOUND)')
})
