'use strict'

const test = require('ava')
const sinon = require('sinon')

const {
  getAvatar,
  getAvatarUrl,
  parseInput
} = require('../../../src/providers/lemmy')

const createLemmy = (got, isReservedIp = async () => false) =>
  require('../../../src/providers/lemmy')({ got, isReservedIp })

const avatarUrl =
  'https://lemmy.world/pictrs/image/2f75baeb-34c1-4a8b-8d1e-bc0a52b47a62.png'

const userResponse = avatar => ({
  statusCode: 200,
  body: { person_view: { person: { name: 'ruud', avatar } } }
})

test('.parseInput accepts user@instance with or without a leading @', t => {
  const expected = { username: 'ruud', server: 'lemmy.world' }
  t.deepEqual(parseInput('ruud@lemmy.world'), expected)
  t.deepEqual(parseInput('@ruud@lemmy.world'), expected)
})

test('.parseInput rejects inputs without a single valid instance', t => {
  for (const input of [
    'ruud',
    '@ruud@',
    '@@localhost:8080',
    'ruud@lemmy.world/u/x',
    '@user@a@127.0.0.1'
  ]) {
    t.is(parseInput(input), undefined, input)
  }
})

test('.getAvatarUrl builds the instance user API URL', t => {
  t.is(
    getAvatarUrl({ username: 'ruud', server: 'lemmy.world' }),
    'https://lemmy.world/api/v3/user?username=ruud'
  )
})

test('.getAvatarUrl encodes the username', t => {
  t.is(
    getAvatarUrl({ username: 'a&b=c', server: 'lemmy.ml' }),
    'https://lemmy.ml/api/v3/user?username=a%26b%3Dc'
  )
})

test('.getAvatar reads the person avatar', t => {
  t.is(getAvatar(userResponse(avatarUrl).body), avatarUrl)
})

test('.getAvatar treats a missing or empty avatar as a miss', t => {
  t.is(getAvatar({ person_view: { person: { name: 'auzy1' } } }), undefined)
  t.is(getAvatar(userResponse('').body), undefined)
  t.is(getAvatar(userResponse(null).body), undefined)
  t.is(getAvatar({ error: 'couldnt_find_person' }), undefined)
})

test('lemmy resolves the avatar from the home instance API', async t => {
  const got = sinon.stub().resolves(userResponse(avatarUrl))

  t.is(await createLemmy(got)('@ruud@lemmy.world'), avatarUrl)
  t.true(got.calledOnce)
  t.is(got.firstCall.args[0], 'https://lemmy.world/api/v3/user?username=ruud')
  t.deepEqual(got.firstCall.args[1], {
    responseType: 'json',
    throwHttpErrors: false
  })
})

test('lemmy returns undefined when the user is missing', async t => {
  const got = sinon.stub().resolves({
    statusCode: 404,
    body: { error: 'couldnt_find_person' }
  })

  t.is(await createLemmy(got)('nobody@lemmy.world'), undefined)
})

test('lemmy returns undefined when the user has no avatar', async t => {
  const got = sinon.stub().resolves({
    statusCode: 200,
    body: { person_view: { person: { name: 'auzy1' } } }
  })

  t.is(await createLemmy(got)('auzy1@lemmy.world'), undefined)
})

test('lemmy does not call the API for unparseable input', async t => {
  const got = sinon.stub()
  const lemmy = createLemmy(got)

  for (const input of ['ruud', '@ruud@', '@@localhost:8080']) {
    t.is(await lemmy(input), undefined, input)
  }

  t.false(got.called)
})

test('lemmy blocks reserved IP addresses (SSRF)', async t => {
  const got = sinon.stub()
  const isReservedIp = sinon.stub().resolves(true)
  const lemmy = createLemmy(got, isReservedIp)

  for (const input of [
    'user@127.0.0.1',
    'user@169.254.169.254',
    'user@10.0.0.1',
    'user@localhost'
  ]) {
    t.is(await lemmy(input), undefined, input)
  }

  t.deepEqual(
    isReservedIp.args.map(([server]) => server),
    ['127.0.0.1', '169.254.169.254', '10.0.0.1', 'localhost']
  )
  t.false(got.called)
})
