'use strict'

const sinon = require('sinon')
const { default: test } = require('ava')

const { NOT_FOUND } = require('../../../src/util/html-provider')

const PROVIDER_URL = 'https://api.example.com/users/kikobeats'
const AVATAR_URL = 'https://cdn.example.com/kikobeats.png'

const createProvider = ({
  response,
  onFetch,
  getter,
  isBlocked,
  gotOpts
} = {}) => {
  const got = sinon
    .stub()
    .resolves(response ?? { statusCode: 200, body: { avatar: AVATAR_URL } })
  const { createApiProvider } = require('../../../src/util/api-provider')({
    got,
    PROXY_TIMEOUT: 8000,
    onFetch
  })
  const provider = createApiProvider({
    name: 'test-provider',
    url: () => PROVIDER_URL,
    getter: getter ?? (({ body }) => body?.avatar),
    isBlocked,
    gotOpts
  })
  return { provider, got }
}

const context = { req: { query: {} }, res: { setHeader: () => {} } }

const captureAttempt = () => {
  const calls = []
  const onFetch = async ({ attempt, ...rest }) => {
    calls.push(rest)
    try {
      return { value: await attempt() }
    } catch (error) {
      return { error }
    }
  }
  return { onFetch, calls }
}

test('returns the avatar the getter reads from the JSON body', async t => {
  const { provider, got } = createProvider()

  t.is(await provider('kikobeats', context), AVATAR_URL)

  const [url, opts] = got.firstCall.args
  t.is(url, PROVIDER_URL)
  t.is(opts.responseType, 'json')
  t.false(opts.throwHttpErrors)
  t.deepEqual(opts.timeout, { request: 8000 })
})

test('a 404 resolves to undefined without calling the getter', async t => {
  const getter = sinon.stub().returns(AVATAR_URL)
  const { provider } = createProvider({
    response: { statusCode: 404, body: {} },
    getter
  })

  t.is(await provider('missing', context), undefined)
  t.false(getter.called)
})

test('a getter NOT_FOUND resolves to undefined', async t => {
  const { provider } = createProvider({ getter: () => NOT_FOUND })

  t.is(await provider('no-avatar', context), undefined)
})

for (const statusCode of [403, 429]) {
  test(`a ${statusCode} is a block, retried by onFetch`, async t => {
    const { onFetch } = captureAttempt()
    const { provider } = createProvider({
      response: { statusCode, body: {} },
      onFetch
    })

    const { error } = await provider('kikobeats', context)

    t.true(error.blocked)
    t.is(error.statusCode, statusCode)
    t.is(error.provider, 'test-provider')
  })
}

test('isBlocked flags blocks the upstream answers with a 200', async t => {
  const { onFetch } = captureAttempt()
  const { provider } = createProvider({
    response: { statusCode: 200, body: { error: { code: 40352 } } },
    isBlocked: ({ body }) => body?.error?.code === 40352,
    getter: () => AVATAR_URL,
    onFetch
  })

  const { error } = await provider('kikobeats', context)

  t.true(error.blocked)
})

test('an unrecognized response is an empty result, retried by onFetch', async t => {
  const { onFetch } = captureAttempt()
  const { provider } = createProvider({ getter: () => undefined, onFetch })

  const { error } = await provider('kikobeats', context)

  t.false(error.blocked)
  t.is(error.code, 'empty_getter_result')
})

test('a missing account is NOT_FOUND to onFetch, so no proxy tier is spent', async t => {
  const { onFetch } = captureAttempt()
  const { provider } = createProvider({
    response: { statusCode: 404, body: {} },
    onFetch
  })

  const { value } = await provider('missing', context)

  t.is(value, NOT_FOUND)
})

test('onFetch receives the request context, provider name, url and kind', async t => {
  const { onFetch, calls } = captureAttempt()
  const { provider } = createProvider({ onFetch })

  await provider('kikobeats', context)

  t.is(calls[0].provider, 'test-provider')
  t.is(calls[0].providerUrl, PROVIDER_URL)
  t.is(calls[0].kind, 'api')
  t.is(calls[0].req, context.req)
  t.is(calls[0].res, context.res)
})

test('onFetch returning NOT_FOUND resolves to undefined', async t => {
  const { provider } = createProvider({ onFetch: async () => NOT_FOUND })

  t.is(await provider('missing', context), undefined)
})

test('a proxy tier passes its agent and timeout to the request', async t => {
  const agent = { https: {} }
  const onFetch = ({ attempt }) =>
    attempt({ tier: 'residential', gotOpts: { agent, timeout: 22000 } })
  const { provider, got } = createProvider({ onFetch })

  t.is(await provider('kikobeats', context), AVATAR_URL)

  const [, opts] = got.firstCall.args
  t.is(opts.agent, agent)
  t.deepEqual(opts.timeout, { request: 22000 })
})

test('provider gotOpts are merged into every request', async t => {
  const { provider, got } = createProvider({
    gotOpts: () => ({ headers: { 'user-agent': 'desktop' } })
  })

  await provider('kikobeats', context)

  t.is(got.firstCall.args[1].headers['user-agent'], 'desktop')
})

test('without onFetch a block resolves to undefined, as before', async t => {
  const { provider } = createProvider({
    response: { statusCode: 403, body: {} }
  })

  t.is(await provider('kikobeats', context), undefined)
})

test('got never retries on its own, so the hook decides every escalation', async t => {
  const { provider, got } = createProvider()

  await provider('kikobeats', context)

  t.deepEqual(got.firstCall.args[1].retry, { limit: 0 })
})

test('a 200 that is not JSON is a block, retried by onFetch', async t => {
  const parseError = Object.assign(new Error('Unexpected token <'), {
    code: 'ERR_BODY_PARSE_FAILURE',
    response: { statusCode: 200 }
  })
  const got = sinon.stub().rejects(parseError)
  const { createApiProvider } = require('../../../src/util/api-provider')({
    got,
    PROXY_TIMEOUT: 8000,
    onFetch: async ({ attempt }) => attempt().catch(error => ({ error }))
  })
  const provider = createApiProvider({
    name: 'test-provider',
    url: () => PROVIDER_URL,
    getter: ({ body }) => body?.avatar
  })

  const { error } = await provider('kikobeats', context)

  t.true(error.blocked)
  t.is(error.statusCode, 200)
  t.is(error.provider, 'test-provider')
})

test('without onFetch a network error propagates instead of reading as not found', async t => {
  const networkError = Object.assign(new Error('getaddrinfo ENOTFOUND'), {
    code: 'ENOTFOUND'
  })
  const got = sinon.stub().rejects(networkError)
  const { createApiProvider } = require('../../../src/util/api-provider')({
    got,
    PROXY_TIMEOUT: 8000
  })
  const provider = createApiProvider({
    name: 'test-provider',
    url: () => PROVIDER_URL,
    getter: ({ body }) => body?.avatar
  })

  const error = await t.throwsAsync(provider('kikobeats', context))

  t.is(error.code, 'ENOTFOUND')
})

test('without onFetch an unrecognized response resolves to undefined', async t => {
  const { provider } = createProvider({ getter: () => undefined })

  t.is(await provider('kikobeats', context), undefined)
})

test('getUrl exposes the url builder', t => {
  const { provider } = createProvider()

  t.is(provider.getUrl('kikobeats'), PROVIDER_URL)
})

for (const statusCode of [400, 500, 502, 503]) {
  test(`a ${statusCode} never reaches the getter and is retried by onFetch`, async t => {
    const getter = sinon.stub().returns(NOT_FOUND)
    const { onFetch } = captureAttempt()
    const { provider } = createProvider({
      response: { statusCode, body: '<html>error</html>' },
      getter,
      onFetch
    })

    const { error } = await provider('kikobeats', context)

    t.false(getter.called)
    t.false(error.blocked)
    t.is(error.code, 'upstream_error')
    t.is(error.statusCode, statusCode)
  })
}

test('provider gotOpts cannot undo the json, no-throw and no-retry contract', async t => {
  const { provider, got } = createProvider({
    gotOpts: () => ({
      responseType: 'text',
      throwHttpErrors: true,
      retry: { limit: 5 }
    })
  })

  await provider('kikobeats', context)

  const opts = got.firstCall.args[1]
  t.is(opts.responseType, 'json')
  t.false(opts.throwHttpErrors)
  t.deepEqual(opts.retry, { limit: 0 })
})

test('with the real got, response bodies are classified by status and shape', async t => {
  const http = require('http')
  const routes = {
    '/html-200': [200, 'text/html', '<html>challenge</html>'],
    '/html-403': [403, 'text/html', '<html>HTTP_FORBIDDEN</html>'],
    '/html-404': [404, 'text/html', '<html>Not found</html>'],
    '/html-502': [502, 'text/html', '<html>Bad Gateway</html>'],
    '/json-200': [
      200,
      'application/json',
      JSON.stringify({ avatar: AVATAR_URL })
    ]
  }
  const server = http.createServer((req, res) => {
    const [statusCode, type, body] = routes[req.url]
    res.writeHead(statusCode, { 'content-type': type })
    res.end(body)
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.teardown(() => server.close())
  const origin = `http://127.0.0.1:${server.address().port}`

  const got = require('got').extend({ dnsCache: false })
  const outcomes = {}
  const { createApiProvider } = require('../../../src/util/api-provider')({
    got,
    PROXY_TIMEOUT: 5000,
    onFetch: async ({ attempt, providerUrl }) => {
      try {
        outcomes[providerUrl] = await attempt()
      } catch (error) {
        outcomes[providerUrl] = error.code
      }
    }
  })

  for (const path of Object.keys(routes)) {
    await createApiProvider({
      name: 'local',
      url: () => origin + path,
      getter: ({ body }) => body?.avatar
    })('input', context)
  }

  t.is(outcomes[origin + '/html-200'], 'blocked')
  t.is(outcomes[origin + '/html-403'], 'blocked')
  t.is(outcomes[origin + '/html-404'], NOT_FOUND)
  t.is(outcomes[origin + '/html-502'], 'upstream_error')
  t.is(outcomes[origin + '/json-200'], AVATAR_URL)
})
