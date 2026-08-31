'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/bluesky')

const createBluesky = got => require('../../../src/providers/bluesky')({ got })

const avatarUrl =
  'https://cdn.bsky.app/img/avatar/plain/did:plc:oky5czdrnfjpqslsw2a5iclo/bafkreihxtnc37g7jqdcgidtkknwuswtjiijcdnc6cx4imc4oq33cnsc5da'

test('.getAvatarUrl builds the profile API URL', t => {
  t.is(
    getAvatarUrl('jay.bsky.team'),
    'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=jay.bsky.team'
  )
})

test('.getAvatarUrl encodes the actor', t => {
  t.is(
    getAvatarUrl('did:plc:oky5czdrnfjpqslsw2a5iclo'),
    'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=did%3Aplc%3Aoky5czdrnfjpqslsw2a5iclo'
  )
})

test('.getAvatar returns the avatar', t => {
  t.is(getAvatar({ avatar: avatarUrl }), avatarUrl)
})

test('.getAvatar treats a missing or empty avatar as a miss', t => {
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ avatar: null }), undefined)
  t.is(getAvatar({ avatar: '' }), undefined)
})

test('bluesky resolves the avatar from the profile API', async t => {
  const bluesky = createBluesky(async (url, opts) => {
    t.is(
      url,
      'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=jay.bsky.team'
    )
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { avatar: avatarUrl } }
  })

  t.is(await bluesky('jay.bsky.team'), avatarUrl)
})

test('bluesky returns undefined when the actor is missing', async t => {
  const bluesky = createBluesky(async () => ({
    statusCode: 400,
    body: { error: 'InvalidRequest', message: 'Profile not found' }
  }))

  t.is(await bluesky('missing.bsky.social'), undefined)
})
