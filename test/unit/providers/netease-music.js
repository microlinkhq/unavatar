'use strict'

const test = require('ava')

const {
  getAvatar,
  getAvatarUrl
} = require('../../../src/providers/netease-music')

const createNeteaseMusic = got =>
  require('../../../src/providers/netease-music')({ got })

const avatarUrl =
  'http://p1.music.126.net/ZN_BmYYBfuXtphZaGRCkbg==/109951169598555174.jpg'

const httpsAvatarUrl =
  'https://p1.music.126.net/ZN_BmYYBfuXtphZaGRCkbg==/109951169598555174.jpg'

test('.getAvatarUrl builds the user detail API URL', t => {
  t.is(
    getAvatarUrl('32953014'),
    'https://music.163.com/api/v1/user/detail/32953014'
  )
})

test('.getAvatar upgrades the avatar URL to https', t => {
  const body = { profile: { avatarUrl } }
  t.is(getAvatar(body), httpsAvatarUrl)
})

test('.getAvatar treats a missing profile as a miss', t => {
  t.is(getAvatar({ code: 404 }), undefined)
})

test('netease-music resolves the avatar from the user detail API', async t => {
  const neteaseMusic = createNeteaseMusic(async (url, opts) => {
    t.is(url, 'https://music.163.com/api/v1/user/detail/32953014')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { profile: { avatarUrl } } }
  })

  t.is(await neteaseMusic('32953014'), httpsAvatarUrl)
})

test('netease-music returns undefined when the user is missing', async t => {
  const neteaseMusic = createNeteaseMusic(async () => ({
    statusCode: 200,
    body: { code: 404 }
  }))

  t.is(await neteaseMusic('999999999999'), undefined)
})
