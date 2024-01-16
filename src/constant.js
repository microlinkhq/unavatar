'use strict'

const { existsSync } = require('fs')
const ms = require('ms')

const TMP_FOLDER = existsSync('/dev/shm') ? '/dev/shm' : '/tmp'

const {
  ALLOWED_REQ_HEADERS = ['accept-encoding', 'accept', 'user-agent'],
  AVATAR_SIZE = 400,
  AVATAR_TIMEOUT = 25000,
  TTL_DEFAULT = ms('1y'),
  TTL_MIN = ms('1h'),
  TTL_MAX = ms('28d'),
  NODE_ENV = 'development',
  PORT = 3000,
  RATE_LIMIT_WINDOW = 86400,
  RATE_LIMIT = 50
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
  TTL_DEFAULT,
  TTL_MIN,
  TTL_MAX,
  NODE_ENV,
  PORT,
  TMP_FOLDER,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT
}
