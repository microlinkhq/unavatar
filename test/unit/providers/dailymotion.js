'use strict'

const { default: test } = require('ava')

const {
  getAvatarUrl,
  getAvatar
} = require('../../../src/providers/dailymotion')

const createDailymotion = got =>
  require('../../../src/providers/dailymotion')({ got })

const CUSTOM_AVATAR_URL = 'https://s2.dmcdn.net/u/QIeO1gofn-FZXxQ2/720x720'
const DEFAULT_AVATAR_URL = 'https://s2.dmcdn.net/d/5000002HraHpp/720x720'

test('.getAvatarUrl builds the encoded user API URL', t => {
  t.is(
    getAvatarUrl('dailymotion'),
    'https://api.dailymotion.com/user/dailymotion?fields=avatar_720_url'
  )
  t.is(
    getAvatarUrl('foo/bar'),
    'https://api.dailymotion.com/user/foo%2Fbar?fields=avatar_720_url'
  )
})

test('.getAvatar returns a custom avatar', t => {
  t.is(getAvatar({ avatar_720_url: CUSTOM_AVATAR_URL }), CUSTOM_AVATAR_URL)
})

test('.getAvatar treats the default placeholder as a miss on any CDN shard', t => {
  t.is(getAvatar({ avatar_720_url: DEFAULT_AVATAR_URL }), undefined)
  t.is(
    getAvatar({
      avatar_720_url: 'https://s1.dmcdn.net/d/5000002HraHpp/720x720'
    }),
    undefined
  )
})

test('.getAvatar returns undefined without an avatar field', t => {
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ avatar_720_url: '' }), undefined)
  t.is(getAvatar(undefined), undefined)
})

test('dailymotion resolves the avatar from the user API', async t => {
  const dailymotion = createDailymotion(async (url, opts) => {
    t.is(
      url,
      'https://api.dailymotion.com/user/dailymotion?fields=avatar_720_url'
    )
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)
    return { statusCode: 200, body: { avatar_720_url: CUSTOM_AVATAR_URL } }
  })

  t.is(await dailymotion('dailymotion'), CUSTOM_AVATAR_URL)
})

test('dailymotion returns undefined for a user with the default avatar', async t => {
  const dailymotion = createDailymotion(async () => ({
    statusCode: 200,
    body: { avatar_720_url: DEFAULT_AVATAR_URL }
  }))

  t.is(await dailymotion('alex_smk600'), undefined)
})

test('dailymotion returns undefined when the user is missing', async t => {
  const dailymotion = createDailymotion(async () => ({
    statusCode: 404,
    body: {
      error: {
        code: 404,
        type: 'not_found',
        message: "Can't find object user for `id' parameter"
      }
    }
  }))

  t.is(await dailymotion('asdkjqwhezxqq9182'), undefined)
})
