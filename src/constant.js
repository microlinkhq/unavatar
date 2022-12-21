'use strict'

const TWENTY_FOUR_HOURS = 86400000

const {
  ALLOWED_REQ_HEADERS = ['user-agent', 'accept', 'x-api-key'],
  AVATAR_SIZE = 400,
  AVATAR_TIMEOUT = 20000,
  CACHE_TTL = TWENTY_FOUR_HOURS,
  NODE_ENV = 'development',
  PORT = 3000
} = process.env

module.exports = {
  ...process.env,
  ALLOWED_REQ_HEADERS,
  AVATAR_SIZE,
  AVATAR_TIMEOUT,
  CACHE_TTL,
  NODE_ENV,
  PORT
}
