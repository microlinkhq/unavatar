'use strict'

const test = require('ava')
const got = require('got')

const { createServer } = require('./helpers')

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
