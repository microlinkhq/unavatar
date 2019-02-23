'use strict'

const TWENTY_FOUR_HOURS = 86400000

const { NODE_ENV = 'development' } = process.env

const IS_PRODUCTION = NODE_ENV === 'production'
const IS_STAGING = NODE_ENV === 'staging'
const IS_DEVELOPMENT = !IS_PRODUCTION && !IS_STAGING

module.exports = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_STAGING,
  IS_DEVELOPMENT,
  CACHE_URI: process.env.CACHE_URI,
  CACHE_TTL: process.env.CACHE_TTL || TWENTY_FOUR_HOURS,
  LOG_LEVEL: process.env.LOG_LEVEL || IS_PRODUCTION ? 'combined' : 'dev',
  AVATAR_SIZE: process.env.AVATAR_SIZE || 400,
  AVATAR_TIMEOUT: process.env.AVATAR_TIMEOUT || 60000,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY
}
