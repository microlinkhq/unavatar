'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/duolingo')

const createDuolingo = got =>
  require('../../../src/providers/duolingo')({ got })

const renderedPicture =
  '//d3gq3s1iyyx31w.cloudfront.net/static/render/bg/BackgroundColor-15/Body-1/Nose%20Piercing-0/SkinTone-2'

test('.getAvatarUrl builds the users API URL with an encoded username', t => {
  t.is(
    getAvatarUrl('luis'),
    'https://www.duolingo.com/2017-06-30/users?username=luis&fields=users%7Bpicture%7D'
  )
  t.is(
    getAvatarUrl('a b&c'),
    'https://www.duolingo.com/2017-06-30/users?username=a+b%26c&fields=users%7Bpicture%7D'
  )
})

test('.getAvatar resolves a protocol-relative picture at the largest size', t => {
  t.is(
    getAvatar({ users: [{ picture: renderedPicture }] }),
    'https://d3gq3s1iyyx31w.cloudfront.net/static/render/bg/BackgroundColor-15/Body-1/Nose%20Piercing-0/SkinTone-2/xxlarge'
  )
})

test('.getAvatar keeps an absolute picture URL and a trailing slash', t => {
  t.is(
    getAvatar({
      users: [
        { picture: 'https://simg-ssl.duolingo.com/ssr-avatars/1/SSR-abc/' }
      ]
    }),
    'https://simg-ssl.duolingo.com/ssr-avatars/1/SSR-abc/xxlarge'
  )
})

test('.getAvatar treats the default avatar placeholder as a miss', t => {
  t.is(
    getAvatar({
      users: [{ picture: '//simg-ssl.duolingo.com/avatar/default_2' }]
    }),
    undefined
  )
  t.is(
    getAvatar({
      users: [{ picture: '//simg-ssl.duolingo.com/avatar/default_1' }]
    }),
    undefined
  )
})

test('.getAvatar treats a missing user or empty picture as a miss', t => {
  t.is(getAvatar({ users: [] }), undefined)
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ users: [{ picture: '' }] }), undefined)
  t.is(getAvatar({ users: [{}] }), undefined)
})

test('duolingo resolves the avatar from the users API', async t => {
  const duolingo = createDuolingo(async (url, opts) => {
    t.is(
      url,
      'https://www.duolingo.com/2017-06-30/users?username=luis&fields=users%7Bpicture%7D'
    )
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { users: [{ picture: renderedPicture }] } }
  })

  t.is(
    await duolingo('luis'),
    'https://d3gq3s1iyyx31w.cloudfront.net/static/render/bg/BackgroundColor-15/Body-1/Nose%20Piercing-0/SkinTone-2/xxlarge'
  )
})

test('duolingo returns undefined when the user does not exist', async t => {
  const duolingo = createDuolingo(async () => ({
    statusCode: 200,
    body: { users: [] }
  }))

  t.is(await duolingo('zzqqxx_not_a_user_9871234'), undefined)
})

test('duolingo returns undefined when the user has the default avatar', async t => {
  const duolingo = createDuolingo(async () => ({
    statusCode: 200,
    body: { users: [{ picture: '//simg-ssl.duolingo.com/avatar/default_2' }] }
  }))

  t.is(await duolingo('kikobeats'), undefined)
})

test('duolingo returns undefined on an HTTP error', async t => {
  const duolingo = createDuolingo(async () => ({
    statusCode: 429,
    body: undefined
  }))

  t.is(await duolingo('luis'), undefined)
})
