'use strict'

const test = require('ava')
const got = require('got').extend({ responseType: 'json' })

const { runServer } = require('./helpers')

const isCI = !!process.env.CI

test('ping', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('ping', {
    prefixUrl: serverUrl,
    responseType: 'text'
  })
  t.is(statusCode, 200)
  t.is(body, 'pong')
})

test('youtube', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('youtube/natelive7?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('gitlab', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('gitlab/kikobeats?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('github', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('github/kikobeats?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('twitter', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('twitter/kikobeats?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('soundcloud', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('soundcloud/kikobeats?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('deviantart', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('deviantart/spyed?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('dribbble', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('dribbble/omidnikrah?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('duckduckgo', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('duckduckgo/google.com?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('google', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('google/teslahunt.io?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('gravatar', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got(
    'gravatar/sindresorhus@gmail.com?json',
    {
      prefixUrl: serverUrl
    }
  )
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('telegram', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('telegram/drsdavidsoft?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})
;(isCI ? test.skip : test)('substack', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('substack/failingwithdata?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('reddit', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('reddit/kikobeats?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})
;(isCI ? test.skip : test)('instagram', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('instagram/willsmith?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('twitch', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('twitch/midudev?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('microlink', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('microlink/teslahunt.io?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})
;(isCI ? test.skip : test)('tiktok', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('tiktok/carlosazaustre?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})

test('onlyfans', async t => {
  const serverUrl = await runServer(t)
  const { body, statusCode } = await got('onlyfans/amandaribas?json', {
    prefixUrl: serverUrl
  })
  t.is(statusCode, 200)
  t.true(body.url.includes('images.weserv.nl'))
})
