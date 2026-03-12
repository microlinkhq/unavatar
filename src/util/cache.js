'use strict'

const ms = require('ms')

module.exports = ({ createMultiCache, createRedisCache }) => ({
  dnsCache: createMultiCache(createRedisCache({ namespace: 'dns', ttl: ms('1d') })),
  pingCache: createMultiCache(createRedisCache({ namespace: 'ping', ttl: ms('1d') })),
  itunesSearchCache: createRedisCache({ namespace: 'itunes-search', ttl: ms('7d') })
})
