'use strict'

const Keyv = require('@keyvhq/core')
const crypto = require('crypto')
const test = require('ava')

const createLibravatar = require('../../../src/providers/libravatar')
const { parseInput } = createLibravatar
const autoFactory = require('../../../src/avatar/auto')
const { providerTiers } = require('../../../src/providers')({
  constants: require('../../../src/constant'),
  createHtmlProvider: () => async function () {},
  getOgImage: () => undefined,
  got: Object.assign(() => {}, { gotOpts: {} }),
  dnsResolver: {},
  bimiCache: new Keyv({ store: new Map() }),
  githubSearchCache: new Keyv({ store: new Map() }),
  itunesSearchCache: new Keyv({ store: new Map() })
})

const EMAIL_HASH =
  'ad49d0c7b7ca8dc5d24bed5a5f64b4c3a1f7d7e3c2f8b2e6de3e0b7b8c43a3a3'
const sha256 = str => crypto.createHash('sha256').update(str).digest('hex')
const HELLO_HASH = sha256('hello@example.com')
const QUERY = 's=512&d=404&gravatarproxy=n'

const createDnsResolver = (answer = []) => {
  const calls = []
  return {
    calls,
    resolveSrv: async name => {
      calls.push(name)
      if (answer instanceof Error) throw answer
      return answer
    }
  }
}

test('parseInput hashes a normalized email and keeps its domain', t => {
  t.deepEqual(parseInput('  Hello@Example.COM '), {
    hash: HELLO_HASH,
    domain: 'example.com'
  })
})

test('parseInput passes a hash through lowercased, with no domain', t => {
  t.deepEqual(parseInput(EMAIL_HASH.toUpperCase()), { hash: EMAIL_HASH })
})

test('an email whose domain publishes no SRV record uses the central server', async t => {
  const dnsResolver = createDnsResolver([])
  const libravatar = createLibravatar({ dnsResolver })

  t.is(
    await libravatar('Hello@Example.com'),
    `https://seccdn.libravatar.org/avatar/${HELLO_HASH}?${QUERY}`
  )
  t.deepEqual(dnsResolver.calls, ['_avatars-sec._tcp.example.com'])
})

test('a DNS failure falls back to the central server', async t => {
  const error = Object.assign(new Error('queryA ENOTFOUND'), {
    code: 'ENOTFOUND'
  })
  const libravatar = createLibravatar({ dnsResolver: createDnsResolver(error) })

  t.is(
    await libravatar('hello@example.com'),
    `https://seccdn.libravatar.org/avatar/${HELLO_HASH}?${QUERY}`
  )
})

test('an email whose domain federates uses that server on the default port', async t => {
  const libravatar = createLibravatar({
    dnsResolver: createDnsResolver([
      { name: 'avatars.example.com.', port: 443, priority: 1, weight: 0 }
    ])
  })

  t.is(
    await libravatar('hello@example.com'),
    `https://avatars.example.com/avatar/${HELLO_HASH}?${QUERY}`
  )
})

test('a federated server on a custom port keeps the port', async t => {
  const libravatar = createLibravatar({
    dnsResolver: createDnsResolver([
      { name: 'avatars.example.com', port: 8443, priority: 1, weight: 0 }
    ])
  })

  t.is(
    await libravatar('hello@example.com'),
    `https://avatars.example.com:8443/avatar/${HELLO_HASH}?${QUERY}`
  )
})

test('the lowest priority wins, then the highest weight', async t => {
  const libravatar = createLibravatar({
    dnsResolver: createDnsResolver([
      { name: 'backup.example.com', port: 443, priority: 20, weight: 100 },
      { name: 'light.example.com', port: 443, priority: 10, weight: 5 },
      { name: 'heavy.example.com', port: 443, priority: 10, weight: 50 }
    ])
  })

  t.is(
    await libravatar('hello@example.com'),
    `https://heavy.example.com/avatar/${HELLO_HASH}?${QUERY}`
  )
})

test('a malformed SRV target is skipped for the next valid one', async t => {
  const libravatar = createLibravatar({
    dnsResolver: createDnsResolver([
      { name: 'evil.com/steal#', port: 443, priority: 1, weight: 0 },
      { name: 'zero-port.example.com', port: 0, priority: 2, weight: 0 },
      { name: 'ok.example.com', port: 443, priority: 3, weight: 0 }
    ])
  })

  t.is(
    await libravatar('hello@example.com'),
    `https://ok.example.com/avatar/${HELLO_HASH}?${QUERY}`
  )
})

test('only malformed SRV targets fall back to the central server', async t => {
  const libravatar = createLibravatar({
    dnsResolver: createDnsResolver([
      { name: 'evil.com@attacker.io/x', port: 443, priority: 1, weight: 0 }
    ])
  })

  t.is(
    await libravatar('hello@example.com'),
    `https://seccdn.libravatar.org/avatar/${HELLO_HASH}?${QUERY}`
  )
})

test('a hash goes to the central server without a DNS lookup', async t => {
  const dnsResolver = createDnsResolver([
    { name: 'avatars.example.com', port: 443, priority: 1, weight: 0 }
  ])
  const libravatar = createLibravatar({ dnsResolver })
  const md5 = crypto.createHash('md5').update('hello@example.com').digest('hex')

  t.is(
    await libravatar(md5.toUpperCase()),
    `https://seccdn.libravatar.org/avatar/${md5}?${QUERY}`
  )
  t.deepEqual(dnsResolver.calls, [])
})

const createRouter = found => {
  const called = []
  const provider = name => async () => {
    called.push(name)
    return `https://${name}.test/avatar.png`
  }
  const providers = Object.fromEntries(
    ['gravatar', 'github', 'libravatar', 'bimi'].map(name => [
      name,
      provider(name)
    ])
  )
  const reachableUrl = async url => ({
    url,
    statusCode: found.some(name => url.includes(`//${name}.test/`)) ? 200 : 404
  })
  reachableUrl.isReachable = ({ statusCode }) => statusCode === 200

  const { auto } = autoFactory({
    constants: { REQUEST_TIMEOUT: 1000 },
    providers,
    providerTiers,
    reachableUrl,
    isReservedIp: async () => false
  })

  return { route: input => auto('email')(input), called }
}

test('a gravatar hit for an email never consults libravatar', async t => {
  const { route, called } = createRouter(['gravatar', 'libravatar'])

  t.is((await route('hello@example.com')).provider, 'gravatar')
  t.false(called.includes('libravatar'))
})

test('a gravatar hit for a hash never consults libravatar', async t => {
  const { route, called } = createRouter(['gravatar', 'libravatar'])

  t.is((await route(EMAIL_HASH)).provider, 'gravatar')
  t.deepEqual(called, ['gravatar'])
})

test('libravatar answers an email that gravatar and github miss, before bimi', async t => {
  const { route, called } = createRouter(['libravatar', 'bimi'])

  t.is((await route('hello@example.com')).provider, 'libravatar')
  t.false(called.includes('bimi'))
})

test('libravatar answers a hash that gravatar misses', async t => {
  const { route } = createRouter(['libravatar'])

  t.is((await route(EMAIL_HASH)).provider, 'libravatar')
})

test('a libravatar miss falls through to bimi', async t => {
  const { route } = createRouter(['bimi'])

  t.is((await route('hello@example.com')).provider, 'bimi')
})
