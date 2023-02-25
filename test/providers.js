'use strict'

const test = require('ava')
const got = require('got')

const { createServer } = require('./helpers')

test('youtube', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('youtube/natelive7?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('gitlab', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('gitlab/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('github', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('github/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})
