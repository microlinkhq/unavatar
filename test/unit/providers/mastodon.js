'use strict'

const { default: test } = require('ava')
const sinon = require('sinon')

const { parseInput, isValidServer } = require('../../../src/providers/mastodon')

test('isValidServer accepts bare hosts with optional port', t => {
  t.true(isValidServer('mastodon.social'))
  t.true(isValidServer('Mastodon.Social'))
  t.true(isValidServer('example.org:8448'))
  t.true(isValidServer('127.0.0.1'))
  t.true(isValidServer('[::1]:8448'))
})

test('isValidServer rejects anything beyond a bare host', t => {
  t.false(isValidServer(''))
  t.false(isValidServer('user:pass@host'))
  t.false(isValidServer('host/path'))
  t.false(isValidServer('host?q=1'))
  t.false(isValidServer('host#hash'))
  t.false(isValidServer('host:443'))
  t.false(isValidServer('host:99999'))
  t.false(isValidServer('a@b'))
})

test('parses @user@server format', t => {
  t.deepEqual(parseInput('@kiko@indieweb.social'), {
    username: 'kiko',
    server: 'indieweb.social'
  })
})

test('parses user@server format without leading @', t => {
  t.deepEqual(parseInput('kiko@indieweb.social'), {
    username: 'kiko',
    server: 'indieweb.social'
  })
})

test('returns undefined for bare username without server', t => {
  t.is(parseInput('kikobeats'), undefined)
})

test('returns undefined for malformed handles', t => {
  t.is(parseInput('@@localhost:8080'), undefined)
  t.is(parseInput('@user@'), undefined)
  t.is(parseInput('@user@a@127.0.0.1'), undefined)
})

const createMastodon = (got, isReservedIp) =>
  require('../../../src/providers/mastodon')({ got, isReservedIp })

test('provider calls the instance lookup API and returns avatar', async t => {
  const avatarUrl =
    'https://files.mastodon.social/accounts/avatars/original/avatar.png'
  const got = sinon.stub().resolves({
    body: { avatar: avatarUrl }
  })

  const mastodon = createMastodon(got, async () => false)
  const result = await mastodon('@kiko@indieweb.social')

  t.is(result, avatarUrl)
  t.true(got.calledOnce)
  t.is(
    got.firstCall.args[0],
    'https://indieweb.social/api/v1/accounts/lookup?acct=kiko'
  )
})

test('provider returns undefined for unparseable input', async t => {
  const got = sinon.stub()
  const mastodon = createMastodon(got, async () => false)
  const result = await mastodon('justausername')

  t.is(result, undefined)
  t.false(got.called)
})

test('provider does not call lookup for malformed handles', async t => {
  const got = sinon.stub()
  const mastodon = createMastodon(got, async () => false)

  for (const input of ['@@localhost:8080', '@user@', '@user@a@127.0.0.1']) {
    const result = await mastodon(input)
    t.is(result, undefined)
  }

  t.false(got.called)
})

test('provider blocks reserved IP addresses (SSRF)', async t => {
  const got = sinon.stub()
  const mastodon = createMastodon(got, async () => true)

  for (const input of [
    '@user@127.0.0.1',
    '@user@169.254.169.254',
    '@user@10.0.0.1',
    '@user@192.168.1.1',
    '@user@0.0.0.0',
    '@user@localhost'
  ]) {
    const result = await mastodon(input)
    t.is(result, undefined, `should block ${input}`)
  }

  t.false(got.called)
})
