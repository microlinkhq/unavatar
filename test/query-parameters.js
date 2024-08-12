'use strict'

const { dataUriToBuffer } = require('data-uri-to-buffer')
const test = require('ava')
const got = require('got')
const ms = require('ms')

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

test('fallback # data uri', async t => {
  {
    const dataURI =
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    const serverUrl = await runServer(t)

    const { headers, body } = await got(
      `github/__notexistprofile__?fallback=${encodeURIComponent(dataURI)}&json`,
      {
        prefixUrl: serverUrl,
        responseType: 'json'
      }
    )

    t.is(body.url, dataURI)
    t.is(headers['content-type'], 'application/json; charset=utf-8')
  }
  {
    const dataURI =
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    const serverUrl = await runServer(t)

    const { headers, body } = await got(
      `github/__notexistprofile__?fallback=${encodeURIComponent(dataURI)}`,
      {
        prefixUrl: serverUrl,
        responseType: 'buffer'
      }
    )

    t.true(body.equals(dataUriToBuffer(dataURI)))
    t.is(headers['content-type'], 'application/octet-stream')
  }
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
  t.is(getTtl(ms('2h')), ms('2h'))
  t.is(getTtl('2h'), ms('2h'))
})
