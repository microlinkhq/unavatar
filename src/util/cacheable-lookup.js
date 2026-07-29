'use strict'

const CacheableLookup = require('cacheable-lookup')

module.exports = ({ TTL_DEFAULT, cache, resolver }) =>
  new CacheableLookup({
    maxTtl: TTL_DEFAULT,
    cache,
    resolver
  })
