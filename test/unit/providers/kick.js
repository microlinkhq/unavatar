'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/kick')

const createKick = got => require('../../../src/providers/kick')({ got })

const avatarUrl =
  'https://files.kick.com/images/user/676/profile_image/conversion/avatar-fullsize.webp'

test('.getAvatarUrl builds the channel API URL', t => {
  t.is(getAvatarUrl('xqc'), 'https://kick.com/api/v2/channels/xqc')
})

test('.getAvatarUrl encodes the input', t => {
  t.is(getAvatarUrl('a b'), 'https://kick.com/api/v2/channels/a%20b')
})

test('.getAvatar returns the profile_pic', t => {
  t.is(getAvatar({ user: { profile_pic: avatarUrl } }), avatarUrl)
})

test('.getAvatar treats a missing or empty profile_pic as a miss', t => {
  t.is(getAvatar({ user: {} }), undefined)
  t.is(getAvatar({ user: { profile_pic: null } }), undefined)
  t.is(getAvatar({ user: { profile_pic: '' } }), undefined)
})

test('kick resolves the avatar from the channels API', async t => {
  const kick = createKick(async (url, opts) => {
    t.is(url, 'https://kick.com/api/v2/channels/xqc')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { user: { profile_pic: avatarUrl } } }
  })

  t.is(await kick('xqc'), avatarUrl)
})

test('kick returns undefined when the channel is missing', async t => {
  const kick = createKick(async () => ({
    statusCode: 404,
    body: { error: 'Not Found', message: 'Channel not found.', status: 404 }
  }))

  t.is(await kick('missing'), undefined)
})
