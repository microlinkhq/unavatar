'use strict'

const Redis = require('ioredis')

module.exports = uri =>
  uri
    ? new Redis(uri, {
      lazyConnect: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 2
    })
    : undefined
