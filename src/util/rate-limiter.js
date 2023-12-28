'use strict'

const RateLimiter = require('async-ratelimiter')

const { RATE_LIMIT_WINDOW, RATE_LIMIT } = require('../constant')

const db = require('./redis').cache

module.exports = db
  ? new RateLimiter({
    db,
    namespace: 'rate',
    duration: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT
  })
  : undefined
