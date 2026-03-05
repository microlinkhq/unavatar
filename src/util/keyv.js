'use strict'

const keyvCompress = require('@keyvhq/compress')
const KeyvRedis = require('@keyvhq/redis')
const KeyvMulti = require('@keyvhq/multi')
const Keyv = require('@keyvhq/core')
const assert = require('assert')

module.exports = ({ TTL_DEFAULT }) => {
  const createMultiCache = remote => new Keyv({ store: new KeyvMulti({ remote }) })

  const createKeyv = opts => new Keyv({ ttl: TTL_DEFAULT, ...opts })

  const createKeyvNamespace = opts => {
    assert(opts.namespace, '`opts.namespace` is required.')
    return keyvCompress(createKeyv(opts))
  }

  const createMemoryCache = opts => createKeyvNamespace({ ...opts, store: new Map() })

  const createRedisCache = (opts = {}) => {
    const store = new Map()
    return createKeyvNamespace({ ...opts, store })
  }

  return { createMemoryCache, createMultiCache, createRedisCache }
}
