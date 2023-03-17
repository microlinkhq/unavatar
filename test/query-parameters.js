'use strict'

const test = require('ava')
const got = require('got')
const ms = require('ms')

const { CACHE_TTL } = require('../src/constant')

const { createServer } = require('./helpers')
const { getTtl } = require('../src/send/cache')

test('json', async t => {
  const serverUrl = await createServer(t)

  const { headers, body } = await got('github/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })

  t.truthy(body.url)
  t.is(headers['content-type'], 'application/json; charset=utf-8')
})

test('fallback', async t => {
  const serverUrl = await createServer(t)

  const { headers, body } = await got(
    'github/__notexistprofile__?fallback=https://i.imgur.com/0d1TFfQ.jpg&json',
    {
      prefixUrl: serverUrl,
      responseType: 'json'
    }
  )

  t.is(body.url, 'https://i.imgur.com/0d1TFfQ.jpg')
  t.is(headers['content-type'], 'application/json; charset=utf-8')
})

test('ttl', t => {
  t.is(getTtl(), CACHE_TTL)
  t.is(getTtl(null), CACHE_TTL)
  t.is(getTtl(undefined), CACHE_TTL)
  t.is(getTtl(0), CACHE_TTL)
  t.is(getTtl('foo'), CACHE_TTL)
  t.is(getTtl('29d'), CACHE_TTL)
  t.is(getTtl('29d'), CACHE_TTL)
  t.is(getTtl(ms('2h')), CACHE_TTL)
  t.is(getTtl('2h'), ms('2h'))
})
