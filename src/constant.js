'use strict'

const TWENTY_FOUR_HOURS = 86400000

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  isProduction,
  cacheURI: process.env.CACHE_URI,
  cacheTTL: process.env.CACHE_TTL || TWENTY_FOUR_HOURS,
  logLevel: process.env.LOGLEVEL || isProduction ? 'combined' : 'dev',
  avatarSize: process.env.AVATAR_SIZE || 400
}
