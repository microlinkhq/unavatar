'use strict'

const { existsSync } = require('fs')
const ms = require('ms')

const TMP_FOLDER = existsSync('/dev/shm') ? '/dev/shm' : '/tmp'

const {
  ALLOWED_REQ_HEADERS = ['accept-encoding', 'accept', 'user-agent'],
  AVATAR_SIZE = 400,
  AVATAR_TIMEOUT = 25000,
  CACHE_TTL = ms('1y'),
  NODE_ENV = 'development',
  PORT = 3000
} = process.env

const API_URL =
  NODE_ENV === 'production' ? 'https://unavatar.io' : `http://127.0.0.1:${PORT}`

module.exports = {
  ...process.env,
  isProduction: NODE_ENV === 'production',
  API_URL,
  ALLOWED_REQ_HEADERS,
  AVATAR_SIZE,
  AVATAR_TIMEOUT: Number(AVATAR_TIMEOUT),
  CACHE_TTL,
  NODE_ENV,
  PORT,
  TMP_FOLDER
}
