'use strict'

const CacheableLookup = require('cacheable-lookup')
const Tangerine = require('tangerine')

const { createMultiCache, createRedisCache } = require('./keyv')

const { CACHE_TTL } = require('../constant')

module.exports = new CacheableLookup({
  maxTtl: CACHE_TTL,
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
