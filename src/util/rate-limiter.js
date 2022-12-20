'use strict'

const RateLimiter = require('async-ratelimiter')
const Redis = require('ioredis')

const createRedis = uri =>
  uri
    ? new Redis(uri, {
      lazyConnect: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 2
    })
    : undefined

const { REDIS_URI, RATE_LIMIT_WINDOW, RATE_LIMIT } = require('../constant')

const db = createRedis(REDIS_URI)

module.exports = new RateLimiter({
  db,
  namespace: 'rate',
  duration: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT
})
