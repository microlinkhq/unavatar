'use strict'

const test = require('ava')
const sinon = require('sinon')

const { parseMastodonInput } = require('../../../src/providers/mastodon')({
  got: () => {}
})

test('parses @user@server format', t => {
  t.deepEqual(parseMastodonInput('@kiko@indieweb.social'), {
    username: 'kiko',
    server: 'indieweb.social'
  })
})

test('parses user@server format without leading @', t => {
  t.deepEqual(parseMastodonInput('kiko@indieweb.social'), {
    username: 'kiko',
    server: 'indieweb.social'
  })
})

test('returns null for bare username without server', t => {
  t.is(parseMastodonInput('kikobeats'), null)
})

test('provider calls the instance lookup API and returns avatar', async t => {
  const avatarUrl =
    'https://files.mastodon.social/accounts/avatars/original/avatar.png'
  const got = sinon.stub().resolves({
    body: { avatar: avatarUrl }
  })

  const mastodon = require('../../../src/providers/mastodon')({ got })
  const result = await mastodon({ input: '@kiko@indieweb.social' })

  t.is(result, avatarUrl)
  t.true(got.calledOnce)
  t.is(
    got.firstCall.args[0],
    'https://indieweb.social/api/v1/accounts/lookup?acct=kiko'
  )
})

test('provider returns undefined for unparseable input', async t => {
  const got = sinon.stub()
  const mastodon = require('../../../src/providers/mastodon')({ got })
  const result = await mastodon({ input: 'justausername' })

  t.is(result, undefined)
  t.false(got.called)
})
