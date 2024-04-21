'use strict'

const redis = require('./util/redis/ua')
const ua = redis ? require('@microlink/ua')(redis) : undefined

module.exports = ua
  ? async (req, _, next) => {
    await ua.incr(req.headers['user-agent'])
    next()
  }
  : false
