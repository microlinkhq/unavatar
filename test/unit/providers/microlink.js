'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

test('microlink provider resolves logo using pro API key', async t => {
  const mql = sinon
    .stub()
    .resolves({ data: { logo: { url: 'https://cdn.example.com/logo.png' } } })

  const microlink = proxyquire('../../../src/providers/microlink', {
    '@microlink/mql': mql
  })({ constants: { MICROLINK_API_KEY: 'pro-key' } })

  const result = await microlink('teslahunt.io', {
    req: { isPro: true, headers: { 'x-api-key': 'free-key' } }
  })

  t.is(result, 'https://cdn.example.com/logo.png')
  t.true(
    mql.calledOnceWithExactly('https://teslahunt.io', {
      apiKey: 'pro-key'
    })
  )
})

test('microlink provider falls back to request API key for non-pro users', async t => {
  const mql = sinon.stub().resolves({
    data: { logo: { url: 'https://cdn.example.com/free-logo.png' } }
  })

  const microlink = proxyquire('../../../src/providers/microlink', {
    '@microlink/mql': mql
  })({ constants: { MICROLINK_API_KEY: 'pro-key' } })

  const result = await microlink('teslahunt.io', {
    req: { isPro: false, headers: { 'x-api-key': 'free-key' } }
  })

  t.is(result, 'https://cdn.example.com/free-logo.png')
  t.true(
    mql.calledOnceWithExactly('https://teslahunt.io', {
      apiKey: 'free-key'
    })
  )
})
