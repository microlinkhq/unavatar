'use strict'

const createPingUrl = require('@microlink/ping-url')

const { gotOpts } = require('./got')
const { createRedisCache } = require('./keyv')

const pingCache = createRedisCache({ namespace: 'ping' })

const pingUrl = createPingUrl(pingCache, {
  value: ({ url, statusCode }) => ({ url, statusCode })
})

module.exports = (url, opts) =>
  pingUrl(url, {
    ...gotOpts,
    ...opts
  })

module.exports.isReachable = createPingUrl.isReachable
