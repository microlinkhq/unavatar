'use strict'

const { default: test } = require('ava')

const {
  createApiProviderCtx,
  NOT_FOUND
} = require('../helpers/create-api-provider')
const factory = require('../../../src/providers/bilibili')

const { getAvatar, getAvatarUrl, isBlocked } = factory

const createBilibili = (got, onFetch) =>
  factory(createApiProviderCtx({ got, onFetch }))

const captureAttempt = async attempt => {
  try {
    return { value: await attempt() }
  } catch (error) {
    return { error }
  }
}

const avatarUrl =
  'https://i2.hdslb.com/bfs/face/ef0457addb24141e15dfac6fbf45293ccf1e32ab.jpg'

test('.getAvatarUrl builds the card API URL', t => {
  t.is(getAvatarUrl('2'), 'https://api.bilibili.com/x/web-interface/card?mid=2')
})

test('.getAvatar returns the face URL', t => {
  const body = { code: 0, data: { card: { face: avatarUrl } } }
  t.is(getAvatar({ body, NOT_FOUND }), avatarUrl)
})

test('.getAvatar treats the noface placeholder as a miss', t => {
  const body = {
    code: 0,
    data: { card: { face: 'https://i0.hdslb.com/bfs/face/member/noface.jpg' } }
  }
  t.is(getAvatar({ body, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar treats missing users and invalid ids as a miss', t => {
  t.is(
    getAvatar({
      body: { code: -404, message: '啥都木有', data: null },
      NOT_FOUND
    }),
    NOT_FOUND
  )
  t.is(
    getAvatar({ body: { code: -400, message: '请求错误' }, NOT_FOUND }),
    NOT_FOUND
  )
})

test('.getAvatar leaves unknown error codes unrecognized', t => {
  t.is(getAvatar({ body: { code: -500 }, NOT_FOUND }), undefined)
})

test('.isBlocked recognizes the risk-control codes', t => {
  t.true(isBlocked({ body: { code: -352, message: '-352' } }))
  t.true(isBlocked({ body: { code: -412 } }))
  t.true(isBlocked({ body: { code: -509 } }))
  t.true(
    isBlocked({ body: { code: -799, message: '请求过于频繁，请稍后再试' } })
  )
  t.false(isBlocked({ body: { code: -404 } }))
  t.false(isBlocked({ body: { code: 0 } }))
})

test('bilibili resolves the face from the card API', async t => {
  const bilibili = createBilibili(async (url, opts) => {
    t.is(url, 'https://api.bilibili.com/x/web-interface/card?mid=2')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: { code: 0, data: { card: { face: avatarUrl } } }
    }
  })

  t.is(await bilibili('2'), avatarUrl)
})

test('bilibili returns undefined when the user is missing', async t => {
  const bilibili = createBilibili(async () => ({
    statusCode: 200,
    body: { code: -404, message: '啥都木有', data: null }
  }))

  t.is(await bilibili('999999999999'), undefined)
})

test('bilibili hands the -352 risk control to the proxy tiers as a block', async t => {
  const bilibili = createBilibili(
    async () => ({
      statusCode: 200,
      body: { code: -352, message: '-352', ttl: 1 }
    }),
    ({ attempt }) => captureAttempt(attempt)
  )

  const { error } = await bilibili('2')

  t.true(error.blocked)
})
