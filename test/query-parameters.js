'use strict'

const { parse } = require('@lukeed/ms')
const test = require('ava')
const got = require('got')

const { TTL_DEFAULT } = require('../src/constant')

const { runServer } = require('./helpers')
const { getTtl } = require('../src/send/cache')

test('json', async t => {
  const serverUrl = await runServer(t)

  const { headers, body } = await got('github/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })

  t.truthy(body.url)
  t.is(headers['content-type'], 'application/json; charset=utf-8')
})

test('fallback', async t => {
  const serverUrl = await runServer(t)

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

test('fallback # use default value if fallback provided is not reachable', async t => {
  const serverUrl = await runServer(t)

  const { headers, body } = await got(
    'github/__notexistprofile__?fallback=https://nexmoe.com/thisis404.png&json',
    {
      prefixUrl: serverUrl,
      responseType: 'json'
    }
  )

  t.is(body.url, `${serverUrl.toString()}fallback.png`)
  t.is(headers['content-type'], 'application/json; charset=utf-8')
})

test('ttl', t => {
  t.is(getTtl(), TTL_DEFAULT)
  t.is(getTtl(''), TTL_DEFAULT)
  t.is(getTtl(null), TTL_DEFAULT)
  t.is(getTtl(undefined), TTL_DEFAULT)
  t.is(getTtl(0), TTL_DEFAULT)
  t.is(getTtl('foo'), TTL_DEFAULT)
  t.is(getTtl('29d'), TTL_DEFAULT)
  t.is(getTtl('29d'), TTL_DEFAULT)
  t.is(getTtl(parse('2h')), parse('2h'))
  t.is(getTtl('2h'), parse('2h'))
})
