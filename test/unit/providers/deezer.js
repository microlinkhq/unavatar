'use strict'

const test = require('ava')

const {
  getAvatar,
  getAvatarUrl,
  parseInput
} = require('../../../src/providers/deezer')

const createDeezer = got => require('../../../src/providers/deezer')({ got })

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
  t.is(getAvatar({ picture_xl: artistUrl }), artistUrl)
})

test('.getAvatar returns cover_xl for albums', t => {
  t.is(getAvatar({ cover_xl: coverUrl }), coverUrl)
})

test('.getAvatar returns album cover_xl for tracks', t => {
  t.is(getAvatar({ album: { cover_xl: coverUrl } }), coverUrl)
})

test('.getAvatar treats the empty-hash placeholder as a miss', t => {
  t.is(
    getAvatar({
      picture_xl: 'https://cdn-images.dzcdn.net/images/artist//500x500.jpg'
    }),
    undefined
  )
})

test('.getAvatar treats an API error as a miss', t => {
  t.is(
    getAvatar({ error: { type: 'DataException', message: 'no data' } }),
    undefined
  )
})

test('deezer resolves the avatar from the artist API', async t => {
  const deezer = createDeezer(async (url, opts) => {
    t.is(url, 'https://api.deezer.com/artist/27')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { picture_xl: artistUrl } }
  })

  t.is(await deezer('27'), artistUrl)
})

test('deezer returns undefined when the entity is missing', async t => {
  const deezer = createDeezer(async () => ({
    statusCode: 200,
    body: { error: { type: 'DataException', message: 'no data' } }
  }))

  t.is(await deezer('0'), undefined)
})
