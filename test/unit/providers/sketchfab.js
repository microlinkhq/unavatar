'use strict'

const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/sketchfab')

const createSketchfab = got =>
  require('../../../src/providers/sketchfab')({ got })

const NASA_PROFILE = {
  username: 'NASA',
  avatar: {
    uid: '97b573111b6640b1958f7cd5763fffa4',
    images: [
      {
        width: 90,
        height: 90,
        url: 'https://media.sketchfab.com/avatars/97b573111b6640b1958f7cd5763fffa4/b616c96a55584f46aa85bc299d86035d.jpeg'
      },
      {
        width: 100,
        height: 100,
        url: 'https://media.sketchfab.com/avatars/97b573111b6640b1958f7cd5763fffa4/4bc94137593949eaa2ad5d5982bbe44f.jpeg'
      },
      {
        width: 32,
        height: 32,
        url: 'https://media.sketchfab.com/avatars/97b573111b6640b1958f7cd5763fffa4/fcac619b64bf4f39852a6260718a4739.jpeg'
      }
    ]
  }
}

const DEFAULT_AVATAR_PROFILE = {
  username: 'areknet',
  avatar: {
    uid: '51af6a870cce449eb75b0345feebaebb',
    images: [
      {
        width: 100,
        height: 100,
        url: 'https://media.sketchfab.com/avatars/51af6a870cce449eb75b0345feebaebb/ab11eedf96374486acb544f71a23b165.jpeg'
      }
    ]
  }
}

test('.getAvatarUrl builds the username lookup URL', t => {
  t.is(getAvatarUrl('nasa'), 'https://api.sketchfab.com/v3/users/@nasa')
})

test('.getAvatarUrl strips a leading @ and encodes the username', t => {
  t.is(getAvatarUrl('@nasa'), 'https://api.sketchfab.com/v3/users/@nasa')
  t.is(getAvatarUrl('a/b'), 'https://api.sketchfab.com/v3/users/@a%2Fb')
})

test('sketchfab resolves the largest avatar image', async t => {
  const sketchfab = createSketchfab(async (url, opts) => {
    t.is(url, 'https://api.sketchfab.com/v3/users/@nasa')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)
    return { statusCode: 200, body: NASA_PROFILE }
  })

  t.is(
    await sketchfab('nasa'),
    'https://media.sketchfab.com/avatars/97b573111b6640b1958f7cd5763fffa4/4bc94137593949eaa2ad5d5982bbe44f.jpeg'
  )
})

test('sketchfab returns undefined for a default placeholder avatar', async t => {
  const sketchfab = createSketchfab(async () => ({
    statusCode: 200,
    body: DEFAULT_AVATAR_PROFILE
  }))

  t.is(await sketchfab('areknet'), undefined)
})

test('sketchfab returns undefined when the avatar has no images', async t => {
  const sketchfab = createSketchfab(async () => ({
    statusCode: 200,
    body: { username: 'empty', avatar: { uid: 'abc', images: [] } }
  }))

  t.is(await sketchfab('empty'), undefined)
})

test('sketchfab returns undefined when the user is missing', async t => {
  const sketchfab = createSketchfab(async () => ({
    statusCode: 404,
    body: { detail: 'Not found.' }
  }))

  t.is(await sketchfab('thisuserdoesnotexist-zq9x7k'), undefined)
})
