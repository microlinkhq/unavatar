'use strict'

const { default: test } = require('ava')

const {
  captureAttempt,
  createApiProviderCtx,
  NOT_FOUND
} = require('../helpers/create-api-provider')
const factory = require('../../../src/providers/zhihu')

const { getAvatar, getAvatarUrl, isBlocked } = factory

const createZhihu = (got, onFetch) =>
  factory(createApiProviderCtx({ got, onFetch }))

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
  t.is(getAvatar({ body, NOT_FOUND }), avatarUrl)
})

test('.getAvatar treats the default avatar as a miss', t => {
  const body = { avatar_url: avatarUrl, use_default_avatar: true }
  t.is(getAvatar({ body, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar treats a missing member as a miss', t => {
  const body = { error: { code: 4041, name: 'ResourceNotFoundException' } }
  t.is(getAvatar({ body, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar leaves other error payloads unrecognized, so they escalate', t => {
  const body = { error: { code: 40362, need_login: true } }
  t.is(getAvatar({ body, NOT_FOUND }), undefined)
  t.is(
    getAvatar({
      body: { error: { code: 40362 }, avatar_url: avatarUrl },
      NOT_FOUND
    }),
    undefined
  )
})

test('.getAvatar treats an empty avatar url as unrecognized', t => {
  t.is(getAvatar({ body: { avatar_url: '' }, NOT_FOUND }), undefined)
})

test('.isBlocked recognizes the 40352 bot check', t => {
  t.true(isBlocked({ body: { error: { code: 40352, need_login: true } } }))
  t.false(isBlocked({ body: { error: { code: 4041 } } }))
  t.false(isBlocked({ body: { avatar_url: avatarUrl } }))
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

test('zhihu always requests the API with a desktop user agent', async t => {
  const desktopUserAgents = require('top-user-agents/desktop')
  const userAgents = []
  const zhihu = createZhihu(async (url, opts) => {
    userAgents.push(opts.headers?.['user-agent'])
    return { statusCode: 200, body: { avatar_url: avatarUrl } }
  })

  for (let i = 0; i < 20; i++) await zhihu('kaifulee')

  t.true(userAgents.every(userAgent => desktopUserAgents.includes(userAgent)))
})

test('zhihu returns undefined when the member is missing', async t => {
  const zhihu = createZhihu(async () => ({
    statusCode: 404,
    body: { error: { code: 4041, name: 'ResourceNotFoundException' } }
  }))

  t.is(await zhihu('missing'), undefined)
})

test('zhihu hands the 40352 bot check to the proxy tiers as a block', async t => {
  const zhihu = createZhihu(
    async () => ({
      statusCode: 403,
      body: { error: { code: 40352, need_login: true } }
    }),
    captureAttempt
  )

  const { error } = await zhihu('kaifulee')

  t.true(error.blocked)
})
