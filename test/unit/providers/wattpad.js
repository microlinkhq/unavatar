'use strict'

const { default: test } = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/wattpad')

const createWattpad = got => require('../../../src/providers/wattpad')({ got })

test('.getAvatarUrl builds the users API URL', t => {
  t.is(
    getAvatarUrl('Wattpad'),
    'https://www.wattpad.com/api/v3/users/Wattpad?fields=avatar'
  )
})

test('.getAvatarUrl strips a leading @', t => {
  t.is(
    getAvatarUrl('@Wattpad'),
    'https://www.wattpad.com/api/v3/users/Wattpad?fields=avatar'
  )
})

test('.getAvatarUrl encodes the username', t => {
  t.is(
    getAvatarUrl('foo/bar'),
    'https://www.wattpad.com/api/v3/users/foo%2Fbar?fields=avatar'
  )
})

test('.getAvatar upgrades the avatar to the largest size', t => {
  t.is(
    getAvatar({
      avatar: 'https://img.wattpad.com/useravatar/Wattpad.128.838617.jpg'
    }),
    'https://img.wattpad.com/useravatar/Wattpad.256.838617.jpg'
  )
})

test('.getAvatar only rewrites the size segment', t => {
  t.is(
    getAvatar({
      avatar: 'https://img.wattpad.com/useravatar/user.42.128.973181.jpg'
    }),
    'https://img.wattpad.com/useravatar/user.42.256.973181.jpg'
  )
})

test('.getAvatar treats stock default avatars as a miss', t => {
  t.is(
    getAvatar({ avatar: 'https://img.wattpad.com/useravatar/f.128.jpg' }),
    undefined
  )
  t.is(
    getAvatar({ avatar: 'https://img.wattpad.com/useravatar/4.128.jpg' }),
    undefined
  )
})

test('.getAvatar returns undefined without an avatar', t => {
  t.is(getAvatar({ avatar: '' }), undefined)
  t.is(getAvatar({}), undefined)
  t.is(getAvatar(undefined), undefined)
})

test('wattpad resolves the avatar from the users API', async t => {
  const wattpad = createWattpad(async (url, opts) => {
    t.is(url, 'https://www.wattpad.com/api/v3/users/Wattpad?fields=avatar')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: {
        avatar: 'https://img.wattpad.com/useravatar/Wattpad.128.838617.jpg'
      }
    }
  })

  t.is(
    await wattpad('Wattpad'),
    'https://img.wattpad.com/useravatar/Wattpad.256.838617.jpg'
  )
})

test('wattpad returns undefined when the user is missing', async t => {
  const wattpad = createWattpad(async () => ({
    statusCode: 400,
    body: {
      error_code: 1014,
      error_type: 'NotFound',
      message: 'User not found'
    }
  }))

  t.is(await wattpad('missing'), undefined)
})

test('wattpad returns undefined for a default avatar', async t => {
  const wattpad = createWattpad(async () => ({
    statusCode: 200,
    body: { avatar: 'https://img.wattpad.com/useravatar/c.128.jpg' }
  }))

  t.is(await wattpad('Rayan1491'), undefined)
})
