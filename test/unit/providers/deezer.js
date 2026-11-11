'use strict'

const { default: test } = require('ava')

const {
  createApiProviderCtx,
  NOT_FOUND
} = require('../helpers/create-api-provider')
const factory = require('../../../src/providers/deezer')

const { getAvatar, getAvatarUrl, parseInput, isBlocked } = factory

const createDeezer = (got, onFetch) =>
  factory(createApiProviderCtx({ got, onFetch }))

const captureAttempt = async attempt => {
  try {
    return { value: await attempt() }
  } catch (error) {
    return { error }
  }
}

const artistUrl =
  'https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/1000x1000-000000-80-0-0.jpg'
const coverUrl =
  'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg'

test('.parseInput defaults to artist', t => {
  t.deepEqual(parseInput('27'), { type: 'artist', id: '27' })
})

test('.parseInput reads an explicit type', t => {
  t.deepEqual(parseInput('album:302127'), { type: 'album', id: '302127' })
})

test('.getAvatarUrl builds the artist API URL', t => {
  t.is(getAvatarUrl('27'), 'https://api.deezer.com/artist/27')
})

test('.getAvatarUrl builds typed API URLs', t => {
  t.is(getAvatarUrl('album:302127'), 'https://api.deezer.com/album/302127')
  t.is(
    getAvatarUrl('playlist:908622995'),
    'https://api.deezer.com/playlist/908622995'
  )
  t.is(getAvatarUrl('track:3135556'), 'https://api.deezer.com/track/3135556')
})

test('.getAvatar returns picture_xl', t => {
  t.is(
    getAvatar({ body: { id: 27, picture_xl: artistUrl }, NOT_FOUND }),
    artistUrl
  )
})

test('.getAvatar returns cover_xl for albums', t => {
  t.is(
    getAvatar({ body: { id: 302127, cover_xl: coverUrl }, NOT_FOUND }),
    coverUrl
  )
})

test('.getAvatar returns album cover_xl for tracks', t => {
  t.is(
    getAvatar({
      body: { id: 3135556, album: { cover_xl: coverUrl } },
      NOT_FOUND
    }),
    coverUrl
  )
})

test('.getAvatar treats the empty-hash placeholder as a miss', t => {
  t.is(
    getAvatar({
      body: {
        id: 1,
        picture_xl: 'https://cdn-images.dzcdn.net/images/artist//500x500.jpg'
      },
      NOT_FOUND
    }),
    NOT_FOUND
  )
})

test('.getAvatar treats the no data error as a miss', t => {
  const body = {
    error: { type: 'DataException', message: 'no data', code: 800 }
  }
  t.is(getAvatar({ body, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar leaves other API errors unrecognized', t => {
  const body = {
    error: {
      type: 'Exception',
      message: 'An unknown error occurred',
      code: 100
    }
  }
  t.is(getAvatar({ body, NOT_FOUND }), undefined)
})

test('.getAvatar treats an invalid query as a miss', t => {
  const body = {
    error: {
      type: 'InvalidQueryException',
      message: 'Invalid query',
      code: 600
    }
  }
  t.is(getAvatar({ body, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar leaves bodies that are not a deezer entity unrecognized, so they escalate', t => {
  for (const body of [
    '<html>502 Bad Gateway</html>',
    '',
    null,
    {},
    { message: 'credits exhausted' }
  ]) {
    t.is(getAvatar({ body, NOT_FOUND }), undefined)
  }
})

test('.isBlocked recognizes the quota error', t => {
  t.true(
    isBlocked({
      body: {
        error: { type: 'Exception', message: 'Quota limit exceeded', code: 4 }
      }
    })
  )
  t.false(isBlocked({ body: { error: { code: 800 } } }))
  t.false(isBlocked({ body: { picture_xl: artistUrl } }))
})

test('deezer resolves whitespace input as missing without a request, since the API 403s on it', async t => {
  let requests = 0
  const deezer = createDeezer(
    async () => {
      requests++
      return { statusCode: 403, body: '<html>HTTP_FORBIDDEN</html>' }
    },
    ({ attempt }) => attempt()
  )

  t.is(await deezer('Daft Punk'), undefined)
  t.is(await deezer('a\tb'), undefined)
  t.is(requests, 0)
})

test('deezer resolves the avatar from the artist API', async t => {
  const deezer = createDeezer(async (url, opts) => {
    t.is(url, 'https://api.deezer.com/artist/27')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { id: 27, picture_xl: artistUrl } }
  })

  t.is(await deezer('27'), artistUrl)
})

test('deezer returns undefined when the entity is missing', async t => {
  const deezer = createDeezer(async () => ({
    statusCode: 200,
    body: { error: { type: 'DataException', message: 'no data', code: 800 } }
  }))

  t.is(await deezer('0'), undefined)
})

test('deezer hands the quota error to the proxy tiers as a block', async t => {
  const deezer = createDeezer(
    async () => ({
      statusCode: 200,
      body: {
        error: { type: 'Exception', message: 'Quota limit exceeded', code: 4 }
      }
    }),
    ({ attempt }) => captureAttempt(attempt)
  )

  const { error } = await deezer('27')

  t.true(error.blocked)
})
