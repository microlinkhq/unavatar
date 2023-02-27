'use strict'

const { existsSync } = require('fs')

const TWENTY_FOUR_HOURS = 86400000

const TMP_FOLDER = existsSync('/dev/shm') ? '/dev/shm' : '/tmp'

const {
  ALLOWED_REQ_HEADERS = ['accept-encoding', 'accept', 'user-agent'],
  AVATAR_SIZE = 400,
  AVATAR_TIMEOUT = 25000,
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
  PORT,
  TMP_FOLDER
}
