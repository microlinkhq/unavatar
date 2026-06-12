'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/bilibili')

const createBilibili = got =>
  require('../../../src/providers/bilibili')({ got })

const avatarUrl =
  'https://i2.hdslb.com/bfs/face/ef0457addb24141e15dfac6fbf45293ccf1e32ab.jpg'

test('.getAvatarUrl builds the card API URL', t => {
  t.is(getAvatarUrl('2'), 'https://api.bilibili.com/x/web-interface/card?mid=2')
})

test('.getAvatar returns the face URL', t => {
  const body = { code: 0, data: { card: { face: avatarUrl } } }
  t.is(getAvatar(body), avatarUrl)
})

test('.getAvatar treats the noface placeholder as a miss', t => {
  const body = {
    code: 0,
    data: { card: { face: 'https://i0.hdslb.com/bfs/face/member/noface.jpg' } }
  }
  t.is(getAvatar(body), undefined)
})

test('.getAvatar treats API errors as a miss', t => {
  t.is(getAvatar({ code: -404, message: '啥都木有', data: null }), undefined)
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
