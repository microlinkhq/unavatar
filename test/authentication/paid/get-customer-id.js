'use strict'

const test = require('ava')

const { create } = require('../../../src/authentication/paid')
const { createOpenKeySetup } = require('../../helpers')

const prefix = 'unavatar-test:get-customer-id:'
const openkeySetup = createOpenKeySetup({ prefix })

test.beforeEach(async () => {
  await openkeySetup.cleanup()
})

test.afterEach(async () => {
  await openkeySetup.cleanup()
})

test('get customer id by api key', async t => {
  const apiKey = await openkeySetup.create({ customerId: '123' })
  const { getCustomerId, CACHE } = create({ prefix })
  t.is(Object.keys(CACHE).length, 0)
  t.is(await getCustomerId(apiKey), '123')
  t.is(await getCustomerId('foo'), null)
  t.is(CACHE[apiKey], '123')
  t.is(Object.keys(CACHE).length, 1)
})
