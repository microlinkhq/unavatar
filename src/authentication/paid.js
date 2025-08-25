'use strict'

const redis = require('../util/redis/metered-billing')

const { REDIS_METERED_BILLING_PREFIX } = require('../constant')

const create = ({ prefix = REDIS_METERED_BILLING_PREFIX } = {}) => {
  const openkey = require('openkey')({ redis, prefix })

  const CACHE = Object.create(null)

  const getCustomerId = async token => {
    const cached = CACHE[token]
    if (cached) return cached

    const data = await openkey.keys.retrieve(token)

    if (data !== null && data.enabled) {
      CACHE[token] = data.metadata.customerId
      return CACHE[token]
    }

    return null
  }

  return {
    getCustomerId,
    CACHE
  }
}

module.exports = create()
module.exports.create = create
