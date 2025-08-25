'use strict'

const test = require('ava')
const got = require('got').extend({
  retry: 0
})

const { runServer, createOpenKeySetup } = require('../../helpers')

const { CACHE, getCustomerId } = require('../../../src/authentication/paid')
const { REDIS_METERED_BILLING_PREFIX } = require('../../../src/constant')

const openkeySetup = createOpenKeySetup({
  prefix: REDIS_METERED_BILLING_PREFIX
})

test.beforeEach(async () => {
  await openkeySetup.cleanup()
})

test.afterEach(async () => {
  await openkeySetup.cleanup()
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
  const apiKey = await openkeySetup.create({
    customerId: '123'
  })

  const serverUrl = await runServer(t)
  const { statusCode } = await got('ping', {
    prefixUrl: serverUrl,
    headers: {
      'x-api-key': apiKey
    },
    throwHttpErrors: false
  })

  t.is(statusCode, 200)
})

test.serial('associate metadata to customer', async t => {
  const apiKey = await openkeySetup.create({
    customerId: '123'
  })

  const serverUrl = await runServer(t)
  const { statusCode } = await got('ping', {
    prefixUrl: serverUrl,
    headers: {
      'x-api-key': apiKey
    },
    throwHttpErrors: false
  })

  t.is(statusCode, 200)
  t.is(CACHE[apiKey], '123')
  t.is(Object.keys(CACHE).length, 1)
  t.is(await getCustomerId(apiKey), '123')
  t.is(Object.keys(CACHE).length, 1)
})
