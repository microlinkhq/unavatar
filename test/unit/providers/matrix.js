'use strict'

const test = require('ava')

const { parseInput, getMediaUrl } = require('../../../src/providers/matrix')

const WELL_KNOWN_URL = 'https://matrix.org/.well-known/matrix/client'
const HOMESERVER_URL = 'https://matrix-client.matrix.org'
const PROFILE_URL =
  'https://matrix-client.matrix.org/_matrix/client/v3/profile/%40matthew%3Amatrix.org/avatar_url'
const AVATAR_URL =
  'https://matrix-client.matrix.org/_matrix/media/v3/download/matrix.org/oUxxDyzQOHdVDMxgwFzyCWEe'

const createGot = routes => {
  const calls = []
  const got = async (url, opts) => {
    calls.push(url)
    const route = routes[url]
    if (route instanceof Error) throw route
    return route ?? { statusCode: 404, body: { errcode: 'M_NOT_FOUND' } }
  }
  got.calls = calls
  return got
}

const createMatrix = (got, isReservedIp = async () => false) =>
  require('../../../src/providers/matrix')({ got, isReservedIp })

const matrixOrgRoutes = {
  [WELL_KNOWN_URL]: {
    statusCode: 200,
    body: { 'm.homeserver': { base_url: `${HOMESERVER_URL}/` } }
  },
  [PROFILE_URL]: {
    statusCode: 200,
    body: { avatar_url: 'mxc://matrix.org/oUxxDyzQOHdVDMxgwFzyCWEe' }
  }
}

test('parses @user:server', t => {
  t.deepEqual(parseInput('@matthew:matrix.org'), {
    userId: '@matthew:matrix.org',
    server: 'matrix.org',
    hostname: 'matrix.org'
  })
})

test('parses user:server without leading @', t => {
  t.deepEqual(parseInput('sumner:nevarro.space'), {
    userId: '@sumner:nevarro.space',
    server: 'nevarro.space',
    hostname: 'nevarro.space'
  })
})

test('defaults a bare username to matrix.org', t => {
  t.deepEqual(parseInput('matthew'), {
    userId: '@matthew:matrix.org',
    server: 'matrix.org',
    hostname: 'matrix.org'
  })
  t.deepEqual(parseInput('@matthew'), {
    userId: '@matthew:matrix.org',
    server: 'matrix.org',
    hostname: 'matrix.org'
  })
})

test('keeps an explicit port on the server', t => {
  t.deepEqual(parseInput('@user:example.org:8448'), {
    userId: '@user:example.org:8448',
    server: 'example.org:8448',
    hostname: 'example.org'
  })
})

test('returns undefined for malformed ids', t => {
  t.is(parseInput(''), undefined)
  t.is(parseInput('@'), undefined)
  t.is(parseInput('@:matrix.org'), undefined)
  t.is(parseInput('@user:'), undefined)
  t.is(parseInput('@user@matrix.org'), undefined)
  t.is(parseInput('@user:evil.com/path'), undefined)
  t.is(parseInput('@user:evil.com?x=1'), undefined)
  t.is(parseInput('@user:a@127.0.0.1'), undefined)
  t.is(parseInput(undefined), undefined)
})

test('.getMediaUrl maps an mxc URI to the download endpoint', t => {
  t.is(
    getMediaUrl(HOMESERVER_URL, 'mxc://matrix.org/oUxxDyzQOHdVDMxgwFzyCWEe'),
    AVATAR_URL
  )
})

test('.getMediaUrl keeps a remote media origin with a port', t => {
  t.is(
    getMediaUrl(HOMESERVER_URL, 'mxc://example.org:8448/abc_123-XYZ'),
    'https://matrix-client.matrix.org/_matrix/media/v3/download/example.org:8448/abc_123-XYZ'
  )
})

test('.getMediaUrl rejects anything that is not an mxc URI', t => {
  t.is(getMediaUrl(HOMESERVER_URL, undefined), undefined)
  t.is(getMediaUrl(HOMESERVER_URL, null), undefined)
  t.is(getMediaUrl(HOMESERVER_URL, ''), undefined)
  t.is(getMediaUrl(HOMESERVER_URL, 'https://evil.com/a.png'), undefined)
  t.is(getMediaUrl(HOMESERVER_URL, 'mxc://matrix.org/../admin'), undefined)
  t.is(getMediaUrl(HOMESERVER_URL, 'mxc://../admin'), undefined)
})

test('resolves the avatar through the well-known homeserver', async t => {
  const got = createGot(matrixOrgRoutes)
  const matrix = createMatrix(got)

  t.is(await matrix('@matthew:matrix.org'), AVATAR_URL)
  t.deepEqual(got.calls, [WELL_KNOWN_URL, PROFILE_URL])
})

test('resolves a bare username on matrix.org', async t => {
  const matrix = createMatrix(createGot(matrixOrgRoutes))
  t.is(await matrix('matthew'), AVATAR_URL)
})

test('falls back to the server name when well-known is missing', async t => {
  const got = createGot({
    'https://nevarro.space/_matrix/client/v3/profile/%40sumner%3Anevarro.space/avatar_url':
      {
        statusCode: 200,
        body: { avatar_url: 'mxc://nevarro.space/mXyVlvxciYhhWIILeUbqtYoJ' }
      }
  })
  const matrix = createMatrix(got)

  t.is(
    await matrix('@sumner:nevarro.space'),
    'https://nevarro.space/_matrix/media/v3/download/nevarro.space/mXyVlvxciYhhWIILeUbqtYoJ'
  )
})

test('falls back to the server name when well-known fails', async t => {
  const got = createGot({
    'https://example.org/.well-known/matrix/client': new Error('ParseError'),
    'https://example.org/_matrix/client/v3/profile/%40user%3Aexample.org/avatar_url':
      { statusCode: 200, body: { avatar_url: 'mxc://example.org/abc123' } }
  })
  const matrix = createMatrix(got)

  t.is(
    await matrix('@user:example.org'),
    'https://example.org/_matrix/media/v3/download/example.org/abc123'
  )
})

test('returns undefined when the user does not exist', async t => {
  const got = createGot({ [WELL_KNOWN_URL]: matrixOrgRoutes[WELL_KNOWN_URL] })
  const matrix = createMatrix(got)

  t.is(await matrix('@nosuchuserxyz123abc:matrix.org'), undefined)
})

test('returns undefined when the user has no avatar', async t => {
  for (const body of [{}, { avatar_url: null }]) {
    const matrix = createMatrix(
      createGot({
        [WELL_KNOWN_URL]: matrixOrgRoutes[WELL_KNOWN_URL],
        [PROFILE_URL]: { statusCode: 200, body }
      })
    )
    t.is(await matrix('@matthew:matrix.org'), undefined)
  }
})

test('returns undefined when the homeserver requires auth for profiles', async t => {
  const matrix = createMatrix(
    createGot({
      [WELL_KNOWN_URL]: matrixOrgRoutes[WELL_KNOWN_URL],
      [PROFILE_URL]: { statusCode: 401, body: { errcode: 'M_MISSING_TOKEN' } }
    })
  )
  t.is(await matrix('@matthew:matrix.org'), undefined)
})

test('does not request anything for malformed ids', async t => {
  const got = createGot({})
  const matrix = createMatrix(got)

  for (const input of ['@:matrix.org', '@user:', '@user:evil.com/path']) {
    t.is(await matrix(input), undefined)
  }
  t.deepEqual(got.calls, [])
})

test('blocks reserved server addresses (SSRF)', async t => {
  const got = createGot({})
  const matrix = createMatrix(got, async () => true)

  for (const input of [
    '@user:127.0.0.1',
    '@user:169.254.169.254',
    '@user:10.0.0.1',
    '@user:localhost:8448'
  ]) {
    t.is(await matrix(input), undefined, `should block ${input}`)
  }
  t.deepEqual(got.calls, [])
})

test('blocks a well-known homeserver on a reserved address (SSRF)', async t => {
  const got = createGot({
    'https://attacker.com/.well-known/matrix/client': {
      statusCode: 200,
      body: { 'm.homeserver': { base_url: 'http://169.254.169.254' } }
    }
  })
  const matrix = createMatrix(
    got,
    async hostname => hostname === '169.254.169.254'
  )

  t.is(await matrix('@user:attacker.com'), undefined)
  t.deepEqual(got.calls, ['https://attacker.com/.well-known/matrix/client'])
})

test('ignores a well-known homeserver with a non-http scheme', async t => {
  const got = createGot({
    'https://example.org/.well-known/matrix/client': {
      statusCode: 200,
      body: { 'm.homeserver': { base_url: 'file:///etc/passwd' } }
    }
  })
  const matrix = createMatrix(got)

  t.is(await matrix('@user:example.org'), undefined)
  t.deepEqual(got.calls, [
    'https://example.org/.well-known/matrix/client',
    'https://example.org/_matrix/client/v3/profile/%40user%3Aexample.org/avatar_url'
  ])
})
