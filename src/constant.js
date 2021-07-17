'use strict'

const TWENTY_FOUR_HOURS = 86400000

const {
  NODE_ENV = 'development',
  CACHE_TTL = TWENTY_FOUR_HOURS,
  LOG_LEVEL = 'tiny',
  AVATAR_SIZE = 400,
  AVATAR_TIMEOUT = 20000,
  ALLOWED_REQ_HEADERS = ['user-agent', 'accept', 'x-api-key']
} = process.env

module.exports = {
  ...process.env,
  NODE_ENV,
  CACHE_TTL,
  LOG_LEVEL,
  AVATAR_SIZE,
  AVATAR_TIMEOUT,
  ALLOWED_REQ_HEADERS
}
