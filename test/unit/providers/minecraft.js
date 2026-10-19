'use strict'

const { default: test } = require('ava')

const { parseInput, getAvatarUrl } = require('../../../src/providers/minecraft')
const constants = require('../../../src/constant')

const NOTCH_UUID = '069a79f444e94726a5befca90e38aaf5'

const createMinecraft = got =>
  require('../../../src/providers/minecraft')({ constants, got })

test('.parseInput treats player names as names', t => {
  t.deepEqual(parseInput('Notch'), { type: 'name', value: 'Notch' })
})

test('.parseInput normalizes dashed uppercase UUIDs', t => {
  t.deepEqual(parseInput('069A79F4-44E9-4726-A5BE-FCA90E38AAF5'), {
    type: 'uuid',
    value: NOTCH_UUID
  })
})

test('.parseInput keeps undashed UUIDs', t => {
  t.deepEqual(parseInput(NOTCH_UUID), { type: 'uuid', value: NOTCH_UUID })
})

test('.parseInput treats a 32 char non-hex string as a name', t => {
  t.deepEqual(parseInput('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'), {
    type: 'name',
    value: 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
  })
})

test('.getAvatarUrl builds the name lookup URL', t => {
  t.is(
    getAvatarUrl('jeb_'),
    'https://api.minecraftservices.com/minecraft/profile/lookup/name/jeb_'
  )
})

test('.getAvatarUrl encodes names', t => {
  t.is(
    getAvatarUrl('bad name/x'),
    'https://api.minecraftservices.com/minecraft/profile/lookup/name/bad%20name%2Fx'
  )
})

test('.getAvatarUrl builds the UUID lookup URL', t => {
  t.is(
    getAvatarUrl('069a79f4-44e9-4726-a5be-fca90e38aaf5'),
    `https://api.minecraftservices.com/minecraft/profile/lookup/${NOTCH_UUID}`
  )
})

test('minecraft resolves a player name to an mc-heads face render', async t => {
  const calls = []
  const minecraft = createMinecraft(async (url, opts) => {
    calls.push({ url, opts })
    return { statusCode: 200, body: { id: NOTCH_UUID, name: 'Notch' } }
  })

  const result = await minecraft('notch')

  t.is(result, `https://mc-heads.net/avatar/${NOTCH_UUID}/400`)
  t.deepEqual(calls, [
    {
      url: 'https://api.minecraftservices.com/minecraft/profile/lookup/name/notch',
      opts: { responseType: 'json', throwHttpErrors: false }
    }
  ])
})

test('minecraft resolves a dashed UUID through Mojang', async t => {
  const urls = []
  const minecraft = createMinecraft(async url => {
    urls.push(url)
    return { statusCode: 200, body: { id: NOTCH_UUID, name: 'Notch' } }
  })

  const result = await minecraft('069a79f4-44e9-4726-a5be-fca90e38aaf5')

  t.is(result, `https://mc-heads.net/avatar/${NOTCH_UUID}/400`)
  t.deepEqual(urls, [
    `https://api.minecraftservices.com/minecraft/profile/lookup/${NOTCH_UUID}`
  ])
})

test('minecraft returns undefined when the player does not exist', async t => {
  const minecraft = createMinecraft(async () => ({
    statusCode: 404,
    body: {
      errorMessage: "Couldn't find any profile with name zzqqxxnotarealplayer9"
    }
  }))

  t.is(await minecraft('zzqqxxnotarealplayer9'), undefined)
})

test('minecraft returns undefined when Mojang rejects the input', async t => {
  const minecraft = createMinecraft(async () => ({
    statusCode: 400,
    body: { error: 'CONSTRAINT_VIOLATION' }
  }))

  t.is(await minecraft('not-a-valid-name!'), undefined)
})

test('minecraft returns undefined when the profile has no id', async t => {
  const minecraft = createMinecraft(async () => ({
    statusCode: 200,
    body: {}
  }))

  t.is(await minecraft('Notch'), undefined)
})
