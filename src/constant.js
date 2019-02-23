'use strict'

const TWENTY_FOUR_HOURS = 86400000

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  isProduction,
  CACHE_URI: process.env.CACHE_URI,
  CACHE_TTL: process.env.CACHE_TTL || TWENTY_FOUR_HOURS,
  LOGLEVEL: process.env.LOGLEVEL || isProduction ? 'combined' : 'dev',
  AVATAR_SIZE: process.env.AVATAR_SIZE || 400,
  AVATAR_TIMEOUT: process.env.AVATAR_TIMEOUT || 60000,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY
}
