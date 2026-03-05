'use strict'

const test = require('ava')
const sinon = require('sinon')

const autoFactory = require('../../../src/avatar/auto')

test('getInputType classifies email input', t => {
  t.is(autoFactory.getInputType('hello@microlink.io'), 'email')
})

test('getInputType classifies domain input', t => {
  t.is(autoFactory.getInputType('reddit.com'), 'domain')
})

test('getInputType classifies username input', t => {
  t.is(autoFactory.getInputType('kikobeats'), 'username')
})

test('auto(type) uses the provided input type resolver', async t => {
  const provider = sinon.stub().resolves('https://example.com/avatar.png')
  const reachableUrl = sinon.stub().resolves({
    statusCode: 200,
    url: 'https://example.com/avatar.png'
  })
  reachableUrl.isReachable = sinon.stub().returns(true)

  const { auto } = autoFactory({
    constants: { REQUEST_TIMEOUT: 25000 },
    providers: { google: provider },
    providersBy: { domain: ['google'], email: [], username: [] },
    reachableUrl
  })

  const resolver = auto('domain')
  const result = await resolver({ input: 'kikobeats' })

  t.is(typeof resolver, 'function')
  t.true(provider.calledOnce)
  t.deepEqual(result, {
    type: 'url',
    data: 'https://example.com/avatar.png',
    provider: 'google'
  })
})
