'use strict'

const CacheableLookup = require('cacheable-lookup')
const Tangerine = require('tangerine')

const { createMultiCache, createRedisCache } = require('./keyv')

const { TTL_DEFAULT } = require('../constant')

module.exports = new CacheableLookup({
  maxTtl: TTL_DEFAULT,
  cache: createMultiCache(createRedisCache({ namespace: 'dns' })),
  resolver: new Tangerine(
    {
      cache: false
    },
    require('got').extend({
      responseType: 'buffer',
      decompress: false,
      retry: 0
    })
  )
})
