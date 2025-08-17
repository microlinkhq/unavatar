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
  RATE_LIMIT = 50,
  REDIS_URI = 'redis://localhost:6379'
} = process.env

const API_URL =
  NODE_ENV === 'production' ? 'https://unavatar.io' : `http://127.0.0.1:${PORT}`

module.exports = {
  ...process.env,
  isProduction: NODE_ENV === 'production',
  ALLOWED_REQ_HEADERS,
  API_URL,
  AVATAR_SIZE,
  AVATAR_TIMEOUT: Number(AVATAR_TIMEOUT),
  NODE_ENV,
  PORT,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT,
  REDIS_URI,
  TMP_FOLDER,
  TTL_DEFAULT,
  TTL_MAX,
  TTL_MIN
}
