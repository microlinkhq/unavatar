'use strict'

const { default: test } = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/chesscom')

const createChesscom = got =>
  require('../../../src/providers/chesscom')({ got })

const avatarUrl =
  'https://images.chesscomfiles.com/uploads/v1/user/15448422.88c010c1.200x200o.3c5619f5441e.png'

test('.getAvatarUrl builds the player API URL', t => {
  t.is(getAvatarUrl('hikaru'), 'https://api.chess.com/pub/player/hikaru')
})

test('.getAvatarUrl lowercases the username', t => {
  t.is(getAvatarUrl('Hikaru'), 'https://api.chess.com/pub/player/hikaru')
})

test('.getAvatarUrl encodes the username', t => {
  t.is(getAvatarUrl('a/b'), 'https://api.chess.com/pub/player/a%2Fb')
})

test('.getAvatar returns the avatar', t => {
  t.is(getAvatar({ avatar: avatarUrl }), avatarUrl)
})

test('.getAvatar treats a missing or empty avatar as a miss', t => {
  t.is(getAvatar({ username: 'chessnoob123' }), undefined)
  t.is(getAvatar({ avatar: null }), undefined)
  t.is(getAvatar({ avatar: '' }), undefined)
  t.is(getAvatar(undefined), undefined)
})

test('chesscom resolves the avatar from the player API', async t => {
  const chesscom = createChesscom(async (url, opts) => {
    t.is(url, 'https://api.chess.com/pub/player/hikaru')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: { avatar: avatarUrl, username: 'hikaru' }
    }
  })

  t.is(await chesscom('Hikaru'), avatarUrl)
})

test('chesscom returns undefined when the player has no avatar', async t => {
  const chesscom = createChesscom(async () => ({
    statusCode: 200,
    body: { player_id: 1429386, username: 'chessnoob123' }
  }))

  t.is(await chesscom('chessnoob123'), undefined)
})

test('chesscom returns undefined when the player is missing', async t => {
  const chesscom = createChesscom(async () => ({
    statusCode: 404,
    body: { code: 0, message: 'User "missing" not found.' }
  }))

  t.is(await chesscom('missing'), undefined)
})
