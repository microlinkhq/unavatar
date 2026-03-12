'use strict'

const CacheableLookup = require('cacheable-lookup')
const Tangerine = require('tangerine')

module.exports = ({ TTL_DEFAULT, DNS_TIMEOUT, DNS_SERVERS, cache }) =>
  new CacheableLookup({
    maxTtl: TTL_DEFAULT,
    cache,
    resolver: new Tangerine(
      {
        cache: false,
        timeout: DNS_TIMEOUT,
        servers: DNS_SERVERS
      },
      require('got').extend({
        responseType: 'buffer',
        decompress: false,
        retry: 0
      })
    )
  })
