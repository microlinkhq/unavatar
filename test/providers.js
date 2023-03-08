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
  t.true(body.url.includes('images.weserv.nl'))
})

test('gitlab', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('gitlab/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('github', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('github/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('twitter', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('twitter/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('soundcloud', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('soundcloud/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('deviantart', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('deviantart/spyed?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('dribbble', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('dribbble/omidnikrah?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('duckduckgo', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('duckduckgo/google.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('google', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('google/teslahunt.io?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('gravatar', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('gravatar/sindresorhus@gmail.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('telegram', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('telegram/drsdavidsoft?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('substack', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('substack/bankless?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('reddit', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('reddit/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('instagram', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('instagram/willsmith?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('microlink', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('microlink/reddit.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test('readcv', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('readcv/elenatorro?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})
