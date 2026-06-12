'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/zhihu')

const createZhihu = got => require('../../../src/providers/zhihu')({ got })

const avatarUrl =
  'https://picx.zhimg.com/v2-39371c20333081cf7220f12d522cab7d_xl.jpg?source=32738c0c&needBackground=1'

test('.getAvatarUrl builds the members API URL', t => {
  t.is(
    getAvatarUrl('kaifulee'),
    'https://www.zhihu.com/api/v4/members/kaifulee?include=avatar_url'
  )
})

test('.getAvatar returns the avatar_url', t => {
  const body = { avatar_url: avatarUrl, use_default_avatar: false }
  t.is(getAvatar(body), avatarUrl)
})

test('.getAvatar treats the default avatar as a miss', t => {
  const body = { avatar_url: avatarUrl, use_default_avatar: true }
  t.is(getAvatar(body), undefined)
})

test('.getAvatar treats error payloads as a miss', t => {
  const body = { error: { code: 40352, need_login: true } }
  t.is(getAvatar(body), undefined)
})

test('zhihu resolves the avatar from the members API', async t => {
  const zhihu = createZhihu(async (url, opts) => {
    t.is(
      url,
      'https://www.zhihu.com/api/v4/members/kaifulee?include=avatar_url'
    )
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: { avatar_url: avatarUrl, use_default_avatar: false }
    }
  })

  t.is(await zhihu('kaifulee'), avatarUrl)
})

test('zhihu returns undefined when the user is missing', async t => {
  const zhihu = createZhihu(async () => ({
    statusCode: 403,
    body: { error: { code: 40352, need_login: true } }
  }))

  t.is(await zhihu('missing'), undefined)
})
