'use strict'

const Redis = require('ioredis')

const { REDIS_URI, REDIS_UA_URI } = require('../constant')

const createClient = uri =>
  uri
    ? new Redis(uri, {
      lazyConnect: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 2
    })
    : undefined

module.exports = {
  cache: createClient(REDIS_URI),
  ua: createClient(REDIS_UA_URI)
}
