'use strict'

const { default: test } = require('ava')
const sinon = require('sinon')
const http = require('http')
const net = require('net')
const fs = require('fs')
const os = require('os')
const path = require('path')
const CacheableLookup = require('cacheable-lookup')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const createGot = require('../../../src/util/got')
const createIsReservedIp = require('../../../src/util/is-reserved-ip')
const createHtmlGet = require('../../../src/util/html-get')
const createReachableUrl = require('../../../src/util/reachable-url')

const PUBLIC_ADDRESS = '93.184.216.34'
const PRIVATE_ADDRESS = '10.0.0.1'
const PUBLIC_SERVER_HOST = '::1'
const INTERNAL_SERVER_HOST = '127.0.0.1'

const createLookupStub = answer =>
  sinon.stub().callsFake((hostname, options, callback) => {
    callback(null, [{ address: answer, family: 4 }])
  })

const buildGot = ({
  isReservedIp = sinon.stub().resolves(false),
  lookup = createLookupStub(PUBLIC_ADDRESS)
} = {}) => {
  const uaHints = sinon
    .stub()
    .callsFake(userAgent => ({ 'sec-ch-ua': `"${userAgent}"` }))
  const randomUserAgent = sinon.stub().returns('custom-agent')
  const uniqueRandomArray = sinon.stub().returns(randomUserAgent)
  const tlsHook = sinon.stub()
  const gotExtend = sinon.stub().returns({ name: 'got-instance' })

  const gotFactory = proxyquire('../../../src/util/got', {
    'ua-hints': uaHints,
    'top-user-agents': ['agent-a', 'agent-b'],
    'unique-random-array': uniqueRandomArray,
    'https-tls/hook': tlsHook,
    got: { extend: gotExtend }
  })

  const cacheableLookup = { lookup }
  const got = gotFactory({ cacheableLookup, isReservedIp })

  return {
    got,
    cacheableLookup,
    gotExtend,
    uaHints,
    randomUserAgent,
    uniqueRandomArray,
    tlsHook
  }
}

test('got util creates instance with dns cache and hooks', t => {
  const {
    got,
    cacheableLookup,
    gotExtend,
    uniqueRandomArray,
    tlsHook,
    uaHints
  } = buildGot()
  const gotOpts = gotExtend.firstCall.args[0]

  t.true(uniqueRandomArray.calledOnce)
  t.deepEqual(uaHints.args, [['agent-a'], ['agent-b']])
  t.true(gotExtend.calledOnceWithExactly(gotOpts))
  t.is(gotOpts.dnsCache, cacheableLookup)
  t.deepEqual(gotOpts.https, { rejectUnauthorized: false })
  t.true(Array.isArray(gotOpts.hooks.beforeRequest))
  t.is(gotOpts.hooks.beforeRequest.length, 3)
  t.is(gotOpts.hooks.beforeRequest[2], tlsHook)
  t.is(gotOpts.hooks.beforeRedirect.length, 1)
  t.is(gotOpts.hooks.beforeRedirect[0], gotOpts.hooks.beforeRequest[0])
  t.is(got.gotOpts, gotOpts)
})

const buildGotWithSpies = ({
  isReservedIp = sinon.stub().resolves(false),
  lookup = createLookupStub(PUBLIC_ADDRESS)
} = {}) => {
  const got = createGot({ cacheableLookup: { lookup }, isReservedIp })
  return { got, isReservedIp, lookup }
}

const lookupThrough = (options, hostname = 'rebind.test') =>
  new Promise(resolve => {
    options.lookup(hostname, { all: true }, (error, addresses) =>
      resolve({ error, addresses })
    )
  })

test('a reserved literal is refused before any lookup and recorded on the context', async t => {
  const { got, isReservedIp, lookup } = buildGotWithSpies()
  const reservedAddressHook = got.gotOpts.hooks.beforeRequest[0]

  for (const url of [
    'https://127.0.0.1/logo.svg',
    'https://169.254.169.254/latest/meta-data',
    'https://[::1]/logo.svg',
    'https://[::ffff:127.0.0.1]/logo.svg',
    'https://0.0.0.0/logo.svg'
  ]) {
    const context = {}
    const { hostname } = new URL(url)
    await t.throwsAsync(reservedAddressHook({ url: new URL(url), context }), {
      message: `Refusing to request a reserved address: ${hostname}`,
      code: 'ERESERVEDADDRESSRANGE'
    })
    t.is(context.reservedAddress, hostname)
  }
  t.false(isReservedIp.called)
  t.false(lookup.called)
})

test('a public literal is left to connect as is', async t => {
  const { got, isReservedIp } = buildGotWithSpies()
  const reservedAddressHook = got.gotOpts.hooks.beforeRequest[0]
  const options = { url: new URL('https://1.1.1.1/logo.svg') }

  await reservedAddressHook(options)

  t.is(options.lookup, undefined)
  t.false(isReservedIp.called)
})

test('a request without a url is left alone', async t => {
  const { got, isReservedIp, lookup } = buildGotWithSpies()
  const options = {}
  await t.notThrowsAsync(got.gotOpts.hooks.beforeRequest[0](options))
  t.is(options.lookup, undefined)
  t.false(isReservedIp.called)
  t.false(lookup.called)
})

test('a hostname connects through the lookup that checks the answer it returns', async t => {
  const lookup = createLookupStub(PUBLIC_ADDRESS)
  const { got, isReservedIp } = buildGotWithSpies({ lookup })
  const reservedAddressHook = got.gotOpts.hooks.beforeRequest[0]
  const options = { url: new URL('https://rebind.test/logo.svg'), context: {} }

  await reservedAddressHook(options)
  const { error, addresses } = await lookupThrough(options)

  t.is(error, null)
  t.deepEqual(addresses, [{ address: PUBLIC_ADDRESS, family: 4 }])
  t.is(lookup.callCount, 1)
  t.false(isReservedIp.called)
  t.is(options.context.reservedAddress, undefined)
})

test('a hostname answering a reserved address is refused at connect time and recorded', async t => {
  const { got } = buildGotWithSpies({
    lookup: createLookupStub(PRIVATE_ADDRESS)
  })
  const reservedAddressHook = got.gotOpts.hooks.beforeRedirect[0]
  const options = { url: new URL('https://rebind.test/logo.svg'), context: {} }

  await reservedAddressHook(options)
  const { error, addresses } = await lookupThrough(options)

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.is(addresses, undefined)
  t.is(options.context.reservedAddress, 'rebind.test')
})

test('a frozen context is never written', async t => {
  const { got } = buildGotWithSpies({
    lookup: createLookupStub(PRIVATE_ADDRESS)
  })
  const context = Object.freeze({})
  const options = { url: new URL('https://rebind.test/'), context }

  await got.gotOpts.hooks.beforeRequest[0](options)
  const { error } = await lookupThrough(options)

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.deepEqual(Object.keys(context), [])
})

test('the connect lookup accepts the two-argument form', async t => {
  const { got } = buildGotWithSpies()
  const options = { url: new URL('https://rebind.test/') }
  await got.gotOpts.hooks.beforeRequest[0](options)

  const answer = await new Promise(resolve => {
    options.lookup('rebind.test', (error, address, family) =>
      resolve({ error, address, family })
    )
  })

  t.deepEqual(answer, { error: null, address: PUBLIC_ADDRESS, family: 4 })
})

test('a proxied request also checks the target name, since the proxy resolves it', async t => {
  const isReservedIp = sinon
    .stub()
    .callsFake(async hostname => hostname === 'metadata.internal')
  const { got, lookup } = buildGotWithSpies({ isReservedIp })
  const reservedAddressHook = got.gotOpts.hooks.beforeRequest[0]
  const agent = { https: {} }

  const refused = {
    url: new URL('https://metadata.internal/'),
    agent,
    context: {}
  }
  await t.throwsAsync(reservedAddressHook(refused), {
    code: 'ERESERVEDADDRESSRANGE'
  })
  t.is(refused.context.reservedAddress, 'metadata.internal')

  const allowed = { url: new URL('https://example.com/'), agent }
  await reservedAddressHook(allowed)
  t.is(typeof allowed.lookup, 'function')

  t.deepEqual(isReservedIp.args, [['metadata.internal'], ['example.com']])
  t.false(lookup.called)
})

test('a unix socket path is refused before got turns it into a socketPath', async t => {
  const { got, isReservedIp, lookup } = buildGotWithSpies()
  const context = {}

  await t.throwsAsync(
    got.gotOpts.hooks.beforeRequest[0]({
      url: new URL('http://unix:/var/run/docker.sock:/containers/json'),
      context
    }),
    { code: 'ERESERVEDADDRESSRANGE' }
  )

  t.is(context.reservedAddress, 'unix')
  t.false(isReservedIp.called)
  t.false(lookup.called)
})

test('a disabled agent is not treated as a proxy', async t => {
  const { got, isReservedIp } = buildGotWithSpies()
  const options = { url: new URL('https://rebind.test/'), agent: false }

  await got.gotOpts.hooks.beforeRequest[0](options)

  t.is(typeof options.lookup, 'function')
  t.false(isReservedIp.called)
})

const createRebindingLookup = answersByHost => {
  const queries = []
  const resolve4 = (hostname, options, callback) => {
    const answers = answersByHost[hostname] ?? [PUBLIC_ADDRESS]
    const asked = queries.filter(query => query.hostname === hostname).length
    const address = answers[Math.min(asked, answers.length - 1)]
    queries.push({ hostname, address })
    callback(null, [{ address, ttl: 0 }])
  }
  const resolve6 = (hostname, options, callback) =>
    callback(Object.assign(new Error('no AAAA'), { code: 'ENODATA' }))
  const cacheableLookup = new CacheableLookup({
    resolver: { resolve4, resolve6 },
    fallbackDuration: 0
  })
  const addressesOf = hostname =>
    queries
      .filter(query => query.hostname === hostname)
      .map(query => query.address)
  return { cacheableLookup, addressesOf }
}

const createRealGot = cacheableLookup =>
  createGot({
    cacheableLookup,
    isReservedIp: createIsReservedIp({ cacheableLookup })
  })

const ROUTES = {
  [PUBLIC_ADDRESS]: { address: PUBLIC_SERVER_HOST, family: 6 },
  [PRIVATE_ADDRESS]: { address: INTERNAL_SERVER_HOST, family: 4 }
}

const routeEntry = entry => ROUTES[entry.address] ?? entry

const routeLookup = lookup => (hostname, lookupOptions, done) =>
  lookup(hostname, lookupOptions, (error, address, family) => {
    if (error) return done(error)
    if (Array.isArray(address)) return done(null, address.map(routeEntry))
    const routed = routeEntry({ address, family })
    return done(null, routed.address, routed.family)
  })

const requestThroughRoutedNetwork = (url, options, callback) =>
  http.request(
    url,
    { ...options, lookup: routeLookup(options.lookup) },
    callback
  )

const listen = (t, host, port, handler) =>
  new Promise((resolve, reject) => {
    const hits = []
    const server = http.createServer((req, res) => {
      hits.push(req.url)
      handler(req, res)
    })
    server.once('error', reject)
    server.listen(port, host, () => {
      t.teardown(() => server.close())
      resolve({ port: server.address().port, hits })
    })
  })

const createNetwork = async (t, { publicHandler, internalHandler }) => {
  const internal = await listen(t, INTERNAL_SERVER_HOST, 0, internalHandler)
  const publicSide = await listen(
    t,
    PUBLIC_SERVER_HOST,
    internal.port,
    publicHandler
  )
  return { port: internal.port, internal, publicSide }
}

const respondPublic = (req, res) => {
  res.setHeader('content-type', 'text/html')
  res.end('<html><body>public-page</body></html>')
}
const respondSecret = (req, res) => res.end('internal-secret')

const REBINDING_NAME = { 'rebind.test': [PUBLIC_ADDRESS, PRIVATE_ADDRESS] }

test('a TTL 0 name that rebinds after the check connects to the address the check saw', async t => {
  const network = await createNetwork(t, {
    publicHandler: respondPublic,
    internalHandler: respondSecret
  })
  const { cacheableLookup, addressesOf } = createRebindingLookup(REBINDING_NAME)
  const got = createRealGot(cacheableLookup)

  const { body } = await got(`http://rebind.test:${network.port}/admin`, {
    retry: 0,
    request: requestThroughRoutedNetwork
  })

  t.true(body.includes('public-page'))
  t.deepEqual(addressesOf('rebind.test'), [PUBLIC_ADDRESS])
  t.deepEqual(network.internal.hits, [])
})

test('a name answering a private address is refused through got with its code', async t => {
  const network = await createNetwork(t, {
    publicHandler: respondPublic,
    internalHandler: respondSecret
  })
  const { cacheableLookup } = createRebindingLookup({
    'rebind.test': [PRIVATE_ADDRESS]
  })
  const got = createRealGot(cacheableLookup)

  const error = await t.throwsAsync(
    got(`http://rebind.test:${network.port}/admin`, {
      retry: 0,
      request: requestThroughRoutedNetwork
    })
  )

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.deepEqual(network.internal.hits, [])
})

test('a stream of a rebinding name never reads the private address', async t => {
  const network = await createNetwork(t, {
    publicHandler: respondPublic,
    internalHandler: respondSecret
  })
  const { cacheableLookup } = createRebindingLookup(REBINDING_NAME)
  const got = createRealGot(cacheableLookup)

  let body = ''
  for await (const chunk of got.stream(
    `http://rebind.test:${network.port}/avatar.png`,
    { retry: 0, request: requestThroughRoutedNetwork }
  )) {
    body += chunk
  }

  t.true(body.includes('public-page'))
  t.deepEqual(network.internal.hits, [])
})

test('a redirect onto a rebinding name connects to the address the check saw', async t => {
  const network = await createNetwork(t, {
    publicHandler: (req, res) => {
      if (req.url === '/admin') return respondPublic(req, res)
      res.writeHead(302, {
        location: `http://rebind.test:${network.port}/admin`
      })
      res.end()
    },
    internalHandler: respondSecret
  })
  const { cacheableLookup, addressesOf } = createRebindingLookup(REBINDING_NAME)
  const got = createRealGot(cacheableLookup)

  const { body } = await got(`http://front.test:${network.port}/`, {
    retry: 0,
    request: requestThroughRoutedNetwork
  })

  t.true(body.includes('public-page'))
  t.deepEqual(network.publicSide.hits, ['/', '/admin'])
  t.deepEqual(addressesOf('rebind.test'), [PUBLIC_ADDRESS])
  t.deepEqual(network.internal.hits, [])
})

test('a redirect onto a reserved literal is refused and recorded', async t => {
  const network = await createNetwork(t, {
    publicHandler: (req, res) => {
      res.writeHead(302, {
        location: 'http://169.254.169.254/latest/meta-data'
      })
      res.end()
    },
    internalHandler: respondSecret
  })
  const { cacheableLookup } = createRebindingLookup({})
  const got = createRealGot(cacheableLookup)
  const context = {}

  const error = await t.throwsAsync(
    got(`http://front.test:${network.port}/`, {
      retry: 0,
      context,
      request: requestThroughRoutedNetwork
    })
  )

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.is(context.reservedAddress, '169.254.169.254')
  t.deepEqual(network.publicSide.hits, ['/'])
})

test('a request carrying a non-proxy agent never reaches the rebound address', async t => {
  const network = await createNetwork(t, {
    publicHandler: respondPublic,
    internalHandler: respondSecret
  })
  const { cacheableLookup } = createRebindingLookup(REBINDING_NAME)
  const got = createRealGot(cacheableLookup)
  const agent = new http.Agent()
  t.teardown(() => agent.destroy())

  const error = await t.throwsAsync(
    got(`http://rebind.test:${network.port}/`, {
      retry: 0,
      agent: { http: agent },
      request: requestThroughRoutedNetwork
    })
  )

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.deepEqual(network.internal.hits, [])
})

test('a unix socket url never reaches the socket', async t => {
  const socketPath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'unavatar-')),
    'docker.sock'
  )
  const connections = []
  const server = net.createServer(socket => {
    connections.push(socket.remoteAddress)
    socket.end()
  })
  await new Promise(resolve => server.listen(socketPath, resolve))
  t.teardown(() => server.close())
  const { cacheableLookup } = createRebindingLookup({})
  const got = createRealGot(cacheableLookup)

  const error = await t.throwsAsync(
    got(`http://unix:${socketPath}:/containers/json`, { retry: 0 })
  )

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.deepEqual(connections, [])
})

test('the provider page fetch through html-get connects to the address the check saw', async t => {
  const network = await createNetwork(t, {
    publicHandler: respondPublic,
    internalHandler: respondSecret
  })
  const { cacheableLookup, addressesOf } = createRebindingLookup(REBINDING_NAME)
  const getHTML = createHtmlGet({
    createBrowser: () => ({
      createContext: async () => ({ destroyContext: async () => {} })
    }),
    got: createRealGot(cacheableLookup)
  })

  const { $ } = await getHTML(`http://rebind.test:${network.port}/`, {
    timeout: 2000,
    gotOpts: { retry: 0, request: requestThroughRoutedNetwork }
  })

  t.true($.html().includes('public-page'))
  t.deepEqual(addressesOf('rebind.test'), [PUBLIC_ADDRESS])
  t.deepEqual(network.internal.hits, [])
})

test('a ping to a name answering a private address reports the reserved address', async t => {
  const network = await createNetwork(t, {
    publicHandler: respondPublic,
    internalHandler: respondSecret
  })
  const { cacheableLookup } = createRebindingLookup({
    'rebind.test': [PRIVATE_ADDRESS]
  })
  const reachableUrl = createReachableUrl({
    got: createRealGot(cacheableLookup),
    pingCache: undefined
  })

  const { reservedAddress } = await reachableUrl(
    `http://rebind.test:${network.port}/avatar.png`,
    { request: requestThroughRoutedNetwork }
  )

  t.is(reservedAddress, 'rebind.test')
  t.deepEqual(network.internal.hits, [])
})

test('got util uses precomputed ua hints for top user agents', t => {
  const { got, uaHints } = buildGot()
  const userAgentHook = got.gotOpts.hooks.beforeRequest[1]

  uaHints.resetHistory()

  const optionsA = { headers: { 'user-agent': 'agent-a' } }
  const optionsB = { headers: { 'user-agent': 'agent-a' } }

  userAgentHook(optionsA)
  userAgentHook(optionsB)

  t.false(uaHints.called)
  t.is(optionsA.headers['sec-ch-ua'], '"agent-a"')
  t.is(optionsB.headers['sec-ch-ua'], '"agent-a"')
})

test('got util computes ua hints for non-top user agents per request', t => {
  const { got, uaHints } = buildGot()
  const userAgentHook = got.gotOpts.hooks.beforeRequest[1]

  uaHints.resetHistory()

  userAgentHook({ headers: { 'user-agent': 'Mozilla/5.0' } })
  userAgentHook({ headers: { 'user-agent': 'Mozilla/5.0' } })

  t.deepEqual(uaHints.args, [['Mozilla/5.0'], ['Mozilla/5.0']])
})

test('got util replaces default got user agent before computing hints', t => {
  const { got, uaHints, randomUserAgent } = buildGot()
  const userAgentHook = got.gotOpts.hooks.beforeRequest[1]
  const options = {
    headers: { 'user-agent': 'got (https://github.com/sindresorhus/got)' }
  }

  uaHints.resetHistory()
  userAgentHook(options)

  t.true(randomUserAgent.calledOnce)
  t.true(uaHints.calledOnceWithExactly('custom-agent'))
  t.is(options.headers['user-agent'], 'custom-agent')
  t.is(options.headers['sec-ch-ua'], '"custom-agent"')
})
