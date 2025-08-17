'use strict'

const redis = require('../util/redis')

const openkey = require('openkey')({ redis, prefix: 'unavatar:' })

const CACHE = Object.create(null)

const hasKey = async token => {
  if (CACHE[token]) return CACHE[token]
  CACHE[token] = (await openkey.keys.retrieve(token)) !== null
  return CACHE[token]
}

module.exports = token => openkey.usage.increment(token)
module.exports.openkey = openkey
module.exports.hasKey = hasKey
