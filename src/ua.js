'use strict'

const redis = require('./util/redis/ua')
const ua = require('@microlink/ua')(redis)

module.exports = async (req, _, next) => {
  await ua.incr(req.headers['user-agent'])
  next()
}
