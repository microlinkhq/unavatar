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

test('twitter', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('twitter/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('soundcloud', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('soundcloud/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('deviantart', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('deviantart/spyed?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('dribbble', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('dribbble/omidnikrah?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('duckduckgo', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('duckduckgo/google.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('google', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('google/teslahunt.io?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('gravatar', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('gravatar/sindresorhus@gmail.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('telegram', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('telegram/drsdavidsoft?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('substack', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('substack/bankless?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('reddit', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('reddit/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})

test('instagram', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('instagram/willsmith?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.snapshot(body)
})
