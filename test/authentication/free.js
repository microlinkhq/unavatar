'use strict'

const test = require('ava')
const got = require('got').extend({
  retry: 0
})

const { RATE_LIMIT } = require('../../src/constant')

const { runServer } = require('../helpers')

test('free tier uses IP address', async t => {
  t.plan(4 * (RATE_LIMIT - 1))

  const serverUrl = await runServer(t)

  const nRequests = Array.from({ length: RATE_LIMIT - 1 }, (_, i) => i)

  for (const index of nRequests) {
    const { statusCode, headers } = await got('ping', {
      prefixUrl: serverUrl,
      throwHttpErrors: false
    })

    t.is(statusCode, 200)
    t.is(headers['x-rate-limit-limit'], String(RATE_LIMIT))
    t.is(headers['x-rate-limit-remaining'], String(RATE_LIMIT - index - 1))
    t.truthy(headers['x-rate-limit-reset'])
  }
})

test('free tier reaches limit', async t => {
  t.plan(4 * (RATE_LIMIT * 2 - 49))

  const serverUrl = await runServer(t)

  const nRequests = Array.from({ length: RATE_LIMIT * 2 }, (_, i) => i)

  for (const index of nRequests) {
    const { statusCode, headers } = await got('ping', {
      prefixUrl: serverUrl,
      throwHttpErrors: false
    })

    if (index < 49) continue
    t.is(statusCode, 429)
    t.is(headers['x-rate-limit-limit'], String(RATE_LIMIT))
    t.is(headers['x-rate-limit-remaining'], '0')
    t.truthy(headers['x-rate-limit-reset'])
  }
})
