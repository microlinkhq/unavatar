'use strict'

const { existsSync } = require('fs')
const ms = require('ms')

const DEFAULTS = {
  AVATAR_SIZE: 400,
  REQUEST_TIMEOUT: 25000,
  TTL_DEFAULT: ms('28d'),
  DNS_SERVERS: ['1.1.1.1', '8.8.8.8'],
  TMP_FOLDER: existsSync('/dev/shm') ? '/dev/shm' : '/tmp',
  DEBUG_HTML_TO_FILE: false
}

DEFAULTS.PROXY_TIMEOUT = Math.floor(DEFAULTS.REQUEST_TIMEOUT * (1 / 3))
DEFAULTS.DNS_TIMEOUT = Math.floor(DEFAULTS.REQUEST_TIMEOUT * (1 / 5))

module.exports = DEFAULTS
