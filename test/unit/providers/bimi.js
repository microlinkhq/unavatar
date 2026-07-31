'use strict'

const proxyquire = require('proxyquire').noPreserveCache()
const Keyv = require('@keyvhq/core')
const test = require('ava')

const { parseInput } = require('../../../src/providers/bimi')

const LOGO_URL = 'https://cdn.microlink.io/logo/logo.svg'

const createProvider = ({
  logos = {},
  resolveLogoUrl,
  isReservedIp = async () => false
} = {}) => {
  let received
  const resolveCalls = []

  const createGetLogo = options => {
    received = options
    return async domain => {
      if (options.resolveLogoUrl && logos[domain]) {
        return options.resolveLogoUrl(logos[domain], options.gotOpts)
      }
      return logos[domain]
    }
  }
  createGetLogo.resolveLogoUrl = async (logoUrl, gotOpts) => {
    resolveCalls.push({ logoUrl, gotOpts })
    if (resolveLogoUrl) return resolveLogoUrl(logoUrl, gotOpts)
    return logoUrl
  }

  const bimiCache = new Keyv({ store: new Map() })
  const gotOpts = { dnsCache: 'the shared lookup' }
  const dnsResolver = { resolveTxt: async hostname => [[hostname]] }

  const bimi = proxyquire('../../../src/providers/bimi', {
    'bimi-url': createGetLogo
  })({ bimiCache, dnsResolver, got: { gotOpts }, isReservedIp })

  return { bimi, received, bimiCache, gotOpts, resolveCalls }
}

test('parseInput keeps a domain and takes the part after the @ of an email', t => {
  t.is(parseInput('shopify.com'), 'shopify.com')
  t.is(parseInput('kiko@shopify.com'), 'shopify.com')
  t.is(parseInput('kiko+bimi@shopify.com'), 'shopify.com')
})

test('resolves through the shared cache, got options and DNS resolver', async t => {
  const { received, bimiCache, gotOpts } = createProvider()

  t.is(received.keyvOpts, bimiCache)
  t.is(received.gotOpts, gotOpts)
  t.deepEqual(await received.resolveTxt('default._bimi.shopify.com'), [
    ['default._bimi.shopify.com']
  ])
})

test('resolves the logo a domain publishes', async t => {
  const { bimi } = createProvider({ logos: { 'shopify.com': LOGO_URL } })

  t.is(await bimi('shopify.com'), LOGO_URL)
})

test('resolves an email through the domain that publishes it', async t => {
  const { bimi } = createProvider({ logos: { 'shopify.com': LOGO_URL } })

  t.is(await bimi('kiko@shopify.com'), LOGO_URL)
})

test('returns undefined when the domain publishes no record', async t => {
  const { bimi } = createProvider()

  t.is(await bimi('example.com'), undefined)
})

test('refuses a logo hosted on a reserved address before fetching', async t => {
  const reserved = new Set(['127.0.0.1'])
  const { bimi, resolveCalls } = createProvider({
    logos: { 'shopify.com': 'https://127.0.0.1/logo.svg' },
    isReservedIp: async hostname => reserved.has(hostname)
  })

  t.is(await bimi('shopify.com'), undefined)
  t.deepEqual(resolveCalls, [])
})

test('refuses a logo that resolves onto a reserved address', async t => {
  const { bimi, resolveCalls } = createProvider({
    logos: { 'shopify.com': LOGO_URL },
    resolveLogoUrl: async () => 'https://169.254.169.254/logo.svg',
    isReservedIp: async hostname => hostname === '169.254.169.254'
  })

  t.is(await bimi('shopify.com'), undefined)
  t.is(resolveCalls.length, 1)
})
