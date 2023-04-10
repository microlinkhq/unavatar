'use strict'

const ms = require('ms')

const memoize = require('../util/memoize')
const send = require('.')

const { CACHE_TTL } = require('../constant')

const getTtl = memoize(ttl => {
  if (ttl === undefined || ttl === null) return CACHE_TTL
  const value = ms(ttl)
  if (Number.isNaN(Number(value))) return CACHE_TTL
  if (value < ms('1h') || value > ms('28d')) return CACHE_TTL
  return value
})

module.exports = require('cacheable-response')({
  logger: require('debug-logfmt')('cacheable-response'),
  ttl: CACHE_TTL,
  staleTtl: false,
  get: async ({ req, res, fn }) => ({
    ttl: getTtl(req.query.ttl),
    data: await fn(req, res)
  }),
  send: ({ req, res, data }) => send({ req, res, ...data })
})

module.exports.getTtl = getTtl
