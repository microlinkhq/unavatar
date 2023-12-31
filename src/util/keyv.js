'use strict'

const keyvCompress = require('@keyvhq/compress')
const KeyvRedis = require('@keyvhq/redis')
const KeyvMulti = require('@keyvhq/multi')
const Keyv = require('@keyvhq/core')
const assert = require('assert')

const redis = require('./redis')

const { CACHE_TTL } = require('../constant')

const createMultiCache = remote =>
  new Keyv({ store: new KeyvMulti({ remote }) })

const createKeyv = opts => new Keyv({ ttl: CACHE_TTL, ...opts })

const createKeyvNamespace = opts => {
  assert(opts.namespace, '`opts.namespace` is required.')
  return keyvCompress(createKeyv(opts))
}

const createRedisCache = opts => {
  const store = redis ? new KeyvRedis(redis, { emitErrors: false }) : new Map()
  return createKeyvNamespace({ ...opts, store })
}

module.exports = { createMultiCache, createRedisCache }
