'use strict'

const test = require('ava')
const got = require('got')

const { createServer } = require('./helpers')

test.serial('youtube', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('youtube/natelive7?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('gitlab', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('gitlab/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('github', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('github/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('twitter', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('twitter/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('soundcloud', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('soundcloud/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('deviantart', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('deviantart/spyed?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('dribbble', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('dribbble/omidnikrah?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('duckduckgo', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('duckduckgo/google.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('google', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('google/teslahunt.io?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('gravatar', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('gravatar/sindresorhus@gmail.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('telegram', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('telegram/drsdavidsoft?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('substack', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('substack/bankless?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('reddit', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('reddit/kikobeats?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('instagram', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('instagram/willsmith?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})

test.serial('microlink', async t => {
  const serverUrl = await createServer(t)
  const { body } = await got('microlink/reddit.com?json', {
    prefixUrl: serverUrl,
    responseType: 'json'
  })
  t.true(body.url.includes('images.weserv.nl'))
})
