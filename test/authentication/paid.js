'use strict'

const test = require('ava')
const got = require('got').extend({
  retry: 0
})

const redis = require('../../src/util/redis')

const { runServer } = require('../helpers')

const createOpenKeySetup = async () => {
  const openkey = require('openkey')({ redis, prefix: 'unavatar:' })
  const plan = await openkey.plans.create({
    id: 'unavatar',
    name: 'paid customers',
    limit: 100,
    period: '28d'
  })

  const key = await openkey.keys.create({
    value: 'oKLJkVqqG2zExUYD',
    plan: plan.id
  })

  return key.value
}

const cleanupOpenKeySetup = async () => {
  const keys = await redis.keys('unavatar:*')
  if (keys.length > 0) {
    await redis.del(keys)
  }
}

test.beforeEach(async () => {
  await cleanupOpenKeySetup()
})

test.afterEach(async () => {
  await cleanupOpenKeySetup()
})

test('pro tier invalid API keys', async t => {
  const serverUrl = await runServer(t)
  const { statusCode, body } = await got('ping', {
    prefixUrl: serverUrl,
    responseType: 'json',
    headers: {
      'x-api-key': 'any-unconfigured-api-key'
    },
    throwHttpErrors: false
  })

  t.is(statusCode, 401)
  t.is(body.status, 'fail')
  t.is(body.code, 'EAPIKEY')
  t.is(body.message, 'Invalid API key')
})

test('pro tier uses api key', async t => {
  const apiKey = await createOpenKeySetup()

  const serverUrl = await runServer(t)
  const { statusCode, headers } = await got('ping', {
    prefixUrl: serverUrl,
    headers: {
      'x-api-key': apiKey
    },
    throwHttpErrors: false
  })

  t.is(statusCode, 200)
  t.truthy(headers['x-rate-limit-limit'])
  t.truthy(headers['x-rate-limit-remaining'])
  t.truthy(headers['x-rate-limit-reset'])
})

test('pro tier reaches limit', async t => {
  const apiKey = await createOpenKeySetup()

  t.plan(4 * (100 * 2 - 100))

  const serverUrl = await runServer(t)

  const nRequests = Array.from({ length: 100 * 2 }, (_, i) => i)

  for (const index of nRequests) {
    const { statusCode, headers } = await got('ping', {
      prefixUrl: serverUrl,
      headers: {
        'x-api-key': apiKey
      },
      throwHttpErrors: false
    })

    if (index < 100) continue
    t.is(statusCode, 429)
    t.is(headers['x-rate-limit-limit'], String(100))
    t.is(headers['x-rate-limit-remaining'], '0')
    t.truthy(headers['x-rate-limit-reset'])
  }
})
