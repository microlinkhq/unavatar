'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

const buildKeyv = ({ redis } = {}) => {
  const KeyvOffline = sinon.stub().callsFake(input => ({ type: 'offline', input }))
  const KeyvRedis = sinon.stub().callsFake(client => ({ type: 'redis', client }))
  const KeyvMulti = sinon.stub().callsFake(({ remote }) => ({ type: 'multi', remote }))
  const Keyv = sinon.stub().callsFake(opts => ({ type: 'keyv', opts }))
  const keyvCompress = sinon.stub().callsFake(input => ({ type: 'compressed', input }))

  const keyvFactory = proxyquire('../../../src/util/keyv', {
    '@keyvhq/compress': keyvCompress,
    '@keyvhq/offline': KeyvOffline,
    '@keyvhq/redis': KeyvRedis,
    '@keyvhq/multi': KeyvMulti,
    '@keyvhq/core': Keyv
  })

  const keyv = keyvFactory({ TTL_DEFAULT: 9000, redis })

  return { keyv, KeyvOffline, KeyvRedis, KeyvMulti, Keyv, keyvCompress }
}

test('createMultiCache wraps remote cache through KeyvMulti store', t => {
  const { keyv, KeyvMulti, Keyv } = buildKeyv()

  const cache = keyv.createMultiCache('remote-store')

  t.deepEqual(cache, {
    type: 'keyv',
    opts: { store: { type: 'multi', remote: 'remote-store' } }
  })
  t.true(KeyvMulti.calledOnceWithExactly({ remote: 'remote-store' }))
  t.true(Keyv.calledOnceWithExactly({ store: { type: 'multi', remote: 'remote-store' } }))
})

test('createRedisCache uses Map store when redis is not provided', t => {
  const { keyv, KeyvRedis, KeyvOffline, keyvCompress, Keyv } = buildKeyv()

  const cache = keyv.createRedisCache({ namespace: 'ping' })

  t.false(KeyvRedis.called)
  t.false(KeyvOffline.called)
  t.true(keyvCompress.calledOnce)
  t.true(Keyv.calledOnce)
  t.is(cache.type, 'compressed')
  t.true(cache.input.opts.store instanceof Map)
})

test('createRedisCache uses KeyvOffline + KeyvRedis when redis is provided', t => {
  const redisClient = { type: 'ioredis' }
  const { keyv, KeyvRedis, KeyvOffline, keyvCompress, Keyv } = buildKeyv({ redis: redisClient })

  const cache = keyv.createRedisCache({ namespace: 'ping' })

  t.true(KeyvRedis.calledOnceWithExactly(redisClient))
  t.true(KeyvOffline.calledOnce)
  t.deepEqual(KeyvOffline.firstCall.args[0], { type: 'redis', client: redisClient })
  t.true(keyvCompress.calledOnce)
  t.true(Keyv.calledOnce)
  t.is(cache.type, 'compressed')
})

test('createMemoryCache always uses Map store', t => {
  const { keyv, KeyvRedis, keyvCompress, Keyv } = buildKeyv()

  const cache = keyv.createMemoryCache({ namespace: 'dns' })

  t.false(KeyvRedis.called)
  t.true(keyvCompress.calledOnce)
  t.true(Keyv.calledOnce)
  t.is(cache.type, 'compressed')
  t.true(cache.input.opts.store instanceof Map)
})

test('createRedisCache requires namespace option', t => {
  const { keyv } = buildKeyv()
  const error = t.throws(() => keyv.createRedisCache({}))
  t.true(error.message.includes('`opts.namespace` is required.'))
})
