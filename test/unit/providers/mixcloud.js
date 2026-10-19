'use strict'

const { default: test } = require('ava')

const {
  parseInput,
  getAvatarUrl,
  getAvatar
} = require('../../../src/providers/mixcloud')

const createMixcloud = got =>
  require('../../../src/providers/mixcloud')({ got })

const THUMBNAILER_URL = 'https://thumbnailer.mixcloud.com/unsafe'
const PROFILE_KEY = 'profile/2/7/9/e/c70a-cdba-4fb6-a57d-c16f5520fdc9'

const createPictures = key => ({
  small: `${THUMBNAILER_URL}/25x25/${key}`,
  thumbnail: `${THUMBNAILER_URL}/50x50/${key}`,
  medium_mobile: `${THUMBNAILER_URL}/80x80/${key}`,
  medium: `${THUMBNAILER_URL}/100x100/${key}`,
  large: `${THUMBNAILER_URL}/300x300/${key}`,
  '320wx320h': `${THUMBNAILER_URL}/320x320/${key}`,
  extra_large: `${THUMBNAILER_URL}/600x600/${key}`,
  '640wx640h': `${THUMBNAILER_URL}/640x640/${key}`
})

test('.parseInput strips a leading @', t => {
  t.is(parseInput('@spartacus'), 'spartacus')
  t.is(parseInput('spartacus'), 'spartacus')
})

test('.getAvatarUrl builds encoded user API URL', t => {
  t.is(getAvatarUrl('spartacus'), 'https://api.mixcloud.com/spartacus/')
  t.is(
    getAvatarUrl('trung-nguyễn189'),
    'https://api.mixcloud.com/trung-nguy%E1%BB%85n189/'
  )
})

test('.getAvatar picks the largest square picture', t => {
  t.is(
    getAvatar({
      pictures: {
        ...createPictures(PROFILE_KEY),
        '1024wx1024h': `${THUMBNAILER_URL}/1024x1024/${PROFILE_KEY}`,
        '1200wx628h': `${THUMBNAILER_URL}/1200x628/${PROFILE_KEY}`
      }
    }),
    `${THUMBNAILER_URL}/1024x1024/${PROFILE_KEY}`
  )
})

test('.getAvatar returns undefined without pictures', t => {
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ pictures: {} }), undefined)
  t.is(getAvatar(undefined), undefined)
})

test('mixcloud resolves the largest picture from the user profile', async t => {
  const mixcloud = createMixcloud(async (url, opts) => {
    t.is(url, 'https://api.mixcloud.com/spartacus/')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: { username: 'spartacus', pictures: createPictures(PROFILE_KEY) }
    }
  })

  t.is(
    await mixcloud('@spartacus'),
    'https://thumbnailer.mixcloud.com/unsafe/640x640/profile/2/7/9/e/c70a-cdba-4fb6-a57d-c16f5520fdc9'
  )
})

test('mixcloud returns undefined for the default placeholder picture', async t => {
  const mixcloud = createMixcloud(async () => ({
    statusCode: 200,
    body: {
      username: 'aaa_716',
      pictures: createPictures('defaults/users/v2/0.png')
    }
  }))

  t.is(await mixcloud('aaa_716'), undefined)
})

test('mixcloud returns undefined when the user is missing', async t => {
  const mixcloud = createMixcloud(async () => ({
    statusCode: 404,
    body: {
      error: {
        type: 'ResourceNotFoundException',
        message: 'User does not exist.'
      }
    }
  }))

  t.is(await mixcloud('zzqxnotarealuser98123'), undefined)
})
