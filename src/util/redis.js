'use strict'

const Redis = require('ioredis')

const { REDIS_URI } = require('../constant')

module.exports = REDIS_URI
  ? new Redis(REDIS_URI, {
    lazyConnect: true,
    enableAutoPipelining: true,
    maxRetriesPerRequest: 2
  })
  : undefined
